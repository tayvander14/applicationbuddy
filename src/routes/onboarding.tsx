import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTIES, INTERESTS, MAJOR_FIELDS, STATES } from "@/lib/data/geo";
import { DEMO_STUDENT } from "@/lib/data/student";
import { useAppStore } from "@/lib/store/app-store";
import type { FafsaStatus, GradeLevel, StateCode, StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your profile — Application Buddy" },
      { name: "description", content: "Tell Application Buddy about your GPA, location, major and activities to get matched with scholarships." },
      { property: "og:title", content: "Build your profile — Application Buddy" },
      { property: "og:description", content: "Tell Application Buddy about your GPA, location, major and activities to get matched with scholarships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["About you", "Where you live", "Your goals", "Activities & eligibility"];

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ChoiceGroup<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            value === o.value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-secondary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Onboarding() {
  const { profile, updateProfile, hydrated } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<StudentProfile>(profile);
  const [activitiesText, setActivitiesText] = useState(profile.activities.join("\n"));

  useEffect(() => {
    if (hydrated) {
      setDraft(profile);
      setActivitiesText(profile.activities.join("\n"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const set = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const counties = COUNTIES.filter((c) => c.state === draft.state);
  const county = COUNTIES.find((c) => c.name === draft.county);

  const stepValid = [
    draft.firstName.trim().length > 0 && draft.gpa >= 0 && draft.gpa <= 4,
    Boolean(draft.county && draft.city),
    Boolean(draft.intendedMajor.trim()),
    true,
  ][step];

  const finish = () => {
    const next = { ...draft, activities: activitiesText.split("\n").map((a) => a.trim()).filter(Boolean) };
    updateProfile(next);
    toast.success("Profile saved", { description: "Your filters and matches are updated." });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Application Buddy home">
            <Logo />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(DEMO_STUDENT);
              setActivitiesText(DEMO_STUDENT.activities.join("\n"));
              toast("Filled with Maya's demo profile");
            }}
          >
            <Wand2 /> Use demo profile
          </Button>
        </div>

        <div className="mt-10">
          <p className="text-sm font-semibold text-primary">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">{STEPS[step]}</h1>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4 h-2" aria-label="Profile progress" />
          <ol className="mt-3 hidden gap-2 text-xs text-muted-foreground sm:flex">
            {STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-1", i <= step && "font-semibold text-foreground")}>
                {i < step ? <Check className="size-3 text-success" /> : <span className="size-1.5 rounded-full bg-current" />} {s}
                {i < STEPS.length - 1 && <span className="mx-1 text-border">/</span>}
              </li>
            ))}
          </ol>
        </div>

        <form
          className="mt-8 space-y-5 rounded-3xl border bg-card p-6 shadow-card sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!stepValid) return;
            if (step < STEPS.length - 1) setStep(step + 1);
            else finish();
          }}
        >
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" htmlFor="firstName">
                  <Input id="firstName" value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} required />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input id="lastName" value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
              </div>
              <Field label="High school" htmlFor="school">
                <Input id="school" value={draft.school} onChange={(e) => set("school", e.target.value)} placeholder="e.g. Eastbrook High School" />
              </Field>
              <Field label="Grade level">
                <ChoiceGroup<GradeLevel>
                  label="Grade level"
                  value={draft.gradeLevel}
                  onChange={(v) => set("gradeLevel", v)}
                  options={(["9th", "10th", "11th", "12th"] as GradeLevel[]).map((g) => ({ value: g, label: `${g} grade` }))}
                />
              </Field>
              <Field label="Unweighted GPA" htmlFor="gpa" hint="On a 4.0 scale. Used to check minimum GPA rules.">
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={4}
                  value={draft.gpa}
                  onChange={(e) => set("gpa", Number(e.target.value))}
                  className="max-w-[140px]"
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="State or district">
                <ChoiceGroup<StateCode>
                  label="State"
                  value={draft.state}
                  onChange={(v) => {
                    const first = COUNTIES.find((c) => c.state === v)!;
                    setDraft((d) => ({ ...d, state: v, county: first.name, city: first.cities[0], district: first.district }));
                  }}
                  options={STATES.map((s) => ({ value: s.code, label: s.name }))}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="County">
                  <Select
                    value={draft.county}
                    onValueChange={(v) => {
                      const c = COUNTIES.find((x) => x.name === v)!;
                      setDraft((d) => ({ ...d, county: v, city: c.cities[0], district: c.district }));
                    }}
                  >
                    <SelectTrigger aria-label="County">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="City">
                  <Select value={draft.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger aria-label="City">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(county?.cities ?? []).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="School district" hint="Filled in from your county. Many local awards are limited to one district.">
                <Input value={draft.district} readOnly aria-readonly className="bg-muted" />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Intended major" htmlFor="major">
                  <Input id="major" value={draft.intendedMajor} onChange={(e) => set("intendedMajor", e.target.value)} placeholder="e.g. Computer Science" />
                </Field>
                <Field label="Field of study">
                  <Select value={draft.majorField} onValueChange={(v) => set("majorField", v)}>
                    <SelectTrigger aria-label="Field of study">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAJOR_FIELDS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Interests" hint="Pick any that fit. These boost matching scholarships but never exclude any.">
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const on = draft.interests.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("interests", on ? draft.interests.filter((x) => x !== i) : [...draft.interests, i])}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                          on ? "border-primary bg-primary-soft text-primary" : "border-input bg-card text-foreground hover:bg-secondary",
                        )}
                      >
                        {on && <Check className="mr-1 inline size-3.5" />}
                        {i}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Activities" htmlFor="activities" hint="One per line — clubs, jobs, sports, family responsibilities all count.">
                <Textarea id="activities" rows={4} value={activitiesText} onChange={(e) => setActivitiesText(e.target.value)} />
              </Field>
              <Field label="Community service hours" htmlFor="hours">
                <Input id="hours" type="number" min={0} value={draft.serviceHours} onChange={(e) => set("serviceHours", Number(e.target.value))} className="max-w-[140px]" />
              </Field>
              <Field label="Will you be the first in your family to attend college?">
                <ChoiceGroup<"yes" | "no" | "unsure">
                  label="First-generation student"
                  value={draft.firstGen === null ? "unsure" : draft.firstGen ? "yes" : "no"}
                  onChange={(v) => set("firstGen", v === "unsure" ? null : v === "yes")}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                    { value: "unsure", label: "Not sure" },
                  ]}
                />
              </Field>
              <Field label="FAFSA status">
                <ChoiceGroup<FafsaStatus>
                  label="FAFSA status"
                  value={draft.fafsa}
                  onChange={(v) => set("fafsa", v)}
                  options={[
                    { value: "not-started", label: "Not started" },
                    { value: "in-progress", label: "In progress" },
                    { value: "submitted", label: "Submitted" },
                  ]}
                />
              </Field>
              <Field label="Gender (optional)" hint="Only used for awards with a stated gender requirement. Leave blank to keep it private.">
                <ChoiceGroup<string>
                  label="Gender"
                  value={draft.gender}
                  onChange={(v) => set("gender", v)}
                  options={[
                    { value: "Woman", label: "Woman" },
                    { value: "Man", label: "Man" },
                    { value: "Nonbinary", label: "Nonbinary" },
                    { value: "", label: "Prefer not to say" },
                  ]}
                />
              </Field>
            </>
          )}

          <div className="flex items-center justify-between border-t pt-5">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild>
                <Link to="/dashboard">Skip for now</Link>
              </Button>
            )}
            <Button type="submit" disabled={!stepValid}>
              {step < STEPS.length - 1 ? (
                <>
                  Continue <ArrowRight />
                </>
              ) : (
                <>
                  Save profile <Check />
                </>
              )}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">Your profile stays on this device in the prototype.</p>
      </div>
    </div>
  );
}
