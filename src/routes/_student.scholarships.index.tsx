import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Search, SlidersHorizontal, SearchX, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState, PageHeader } from "@/components/app/page-header";
import { ScholarshipCard } from "@/components/scholarship/scholarship-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { COUNTIES, MAJOR_FIELDS } from "@/lib/data/geo";
import { SCHOLARSHIPS } from "@/lib/data/scholarships";
import { evaluateMatch } from "@/lib/matching";
import { useAppStore } from "@/lib/store/app-store";
import type { StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/scholarships/")({
  head: () => ({
    meta: [
      { title: "Discover scholarships — Application Buddy" },
      { name: "description", content: "Search local DMV, national and university scholarships by county, school district, major, GPA, deadline and award policy." },
      { property: "og:title", content: "Discover scholarships — Application Buddy" },
      { property: "og:description", content: "Search local DMV, national and university scholarships by county, school district, major, GPA, deadline and award policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Discover,
});

type ScopeFilter = "all" | "local" | "national" | "university";

interface Filters {
  scope: ScopeFilter;
  state: "any" | "DC" | "MD" | "VA";
  county: string;
  district: string;
  major: string;
  meetsGpa: boolean;
  deadline: "any" | "30" | "60";
  minAmount: "0" | "2000" | "5000";
  hideIncompatibleResidency: boolean;
  disbursement: "any" | "student" | "university";
  stackingOnly: boolean;
  verifiedOnly: boolean;
  sort: "match" | "deadline" | "amount";
}

function profileFilters(p: StudentProfile): Filters {
  return {
    scope: "all",
    state: "any",
    county: "any",
    district: "any",
    major: p.majorField === "Undecided" ? "any" : p.majorField,
    meetsGpa: false,
    deadline: "any",
    minAmount: "0",
    hideIncompatibleResidency: true,
    disbursement: "any",
    stackingOnly: false,
    verifiedOnly: false,
    sort: "match",
  };
}

const BLANK: Filters = {
  scope: "all",
  state: "any",
  county: "any",
  district: "any",
  major: "any",
  meetsGpa: false,
  deadline: "any",
  minAmount: "0",
  hideIncompatibleResidency: false,
  disbursement: "any",
  stackingOnly: false,
  verifiedOnly: false,
  sort: "match",
};

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = `t-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-3">
      <Label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function FilterPanel({ f, set, profile }: { f: Filters; set: (p: Partial<Filters>) => void; profile: StudentProfile }) {
  const counties = COUNTIES.filter((c) => f.state === "any" || c.state === f.state);
  return (
    <div className="space-y-5">
      <SelectField
        label="Location"
        value={f.state}
        onChange={(v) => set({ state: v as Filters["state"], county: "any", district: "any" })}
        options={[
          { value: "any", label: "All of the DMV + national" },
          { value: "DC", label: "Washington, D.C." },
          { value: "MD", label: "Maryland" },
          { value: "VA", label: "Virginia" },
        ]}
      />
      <SelectField
        label="County or city"
        value={f.county}
        onChange={(v) => set({ county: v })}
        options={[{ value: "any", label: "Any county" }, ...counties.map((c) => ({ value: c.name, label: c.name }))]}
      />
      <SelectField
        label="School district"
        value={f.district}
        onChange={(v) => set({ district: v })}
        options={[{ value: "any", label: "Any district" }, ...counties.map((c) => ({ value: c.district, label: c.district }))]}
      />
      <SelectField
        label="Major"
        value={f.major}
        onChange={(v) => set({ major: v })}
        options={[{ value: "any", label: "Any major" }, ...MAJOR_FIELDS.filter((m) => m !== "Undecided").map((m) => ({ value: m, label: m }))]}
      />
      <SelectField
        label="Deadline"
        value={f.deadline}
        onChange={(v) => set({ deadline: v as Filters["deadline"] })}
        options={[
          { value: "any", label: "Any open deadline" },
          { value: "30", label: "Within 30 days" },
          { value: "60", label: "Within 60 days" },
        ]}
      />
      <SelectField
        label="Award amount"
        value={f.minAmount}
        onChange={(v) => set({ minAmount: v as Filters["minAmount"] })}
        options={[
          { value: "0", label: "Any amount" },
          { value: "2000", label: "$2,000 or more" },
          { value: "5000", label: "$5,000 or more" },
        ]}
      />
      <SelectField
        label="Paid to"
        value={f.disbursement}
        onChange={(v) => set({ disbursement: v as Filters["disbursement"] })}
        options={[
          { value: "any", label: "Student or university" },
          { value: "student", label: "Paid to me (student)" },
          { value: "university", label: "Paid to my university" },
        ]}
      />
      <div className="space-y-4 border-t pt-5">
        <ToggleField label={`Meets my GPA (${profile.gpa.toFixed(2)})`} checked={f.meetsGpa} onChange={(v) => set({ meetsGpa: v })} />
        <ToggleField
          label="Hide incompatible residency"
          hint={`Removes awards that require living outside ${profile.county}.`}
          checked={f.hideIncompatibleResidency}
          onChange={(v) => set({ hideIncompatibleResidency: v })}
        />
        <ToggleField label="Stacks with other aid" hint="Won't reduce your college's grants." checked={f.stackingOnly} onChange={(v) => set({ stackingOnly: v })} />
        <ToggleField label="Verified listings only" checked={f.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} />
      </div>
    </div>
  );
}

function Discover() {
  const { profile, hydrated } = useAppStore();
  const [query, setQuery] = useState("");
  const [f, setF] = useState<Filters>(() => profileFilters(profile));
  const [fromProfile, setFromProfile] = useState(true);
  const set = (p: Partial<Filters>) => {
    setF((prev) => ({ ...prev, ...p }));
    setFromProfile(false);
  };

  useEffect(() => {
    if (hydrated) setF(profileFilters(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = SCHOLARSHIPS.map((s) => ({ s, m: evaluateMatch(profile, s) })).filter(({ s, m }) => {
      if (s.deadlineInDays < 0) return false;
      if (q && !`${s.name} ${s.provider} ${s.summary}`.toLowerCase().includes(q)) return false;
      if (f.scope !== "all" && s.scope !== f.scope) return false;
      if (f.state !== "any" && s.state !== f.state && !(s.residency?.states?.includes(f.state) ?? false)) return false;
      if (f.county !== "any" && !s.counties.includes(f.county)) return false;
      if (f.district !== "any" && !s.districts.includes(f.district)) return false;
      if (f.major !== "any" && s.majorFields && !s.majorFields.includes(f.major)) return false;
      if (f.meetsGpa && s.minGpa !== null && profile.gpa < s.minGpa) return false;
      if (f.deadline !== "any" && s.deadlineInDays > Number(f.deadline)) return false;
      if (s.amount < Number(f.minAmount)) return false;
      if (f.hideIncompatibleResidency && !m.residencyCompatible) return false;
      if (f.disbursement !== "any" && s.disbursement !== f.disbursement) return false;
      if (f.stackingOnly && s.stacking !== "allowed") return false;
      if (f.verifiedOnly && !s.verified) return false;
      return true;
    });
    return list.sort((a, b) =>
      f.sort === "deadline" ? a.s.deadlineInDays - b.s.deadlineInDays : f.sort === "amount" ? b.s.amount - a.s.amount : b.m.score - a.m.score,
    );
  }, [profile, query, f]);

  const eligibleCount = results.filter((r) => r.m.fullyEligible).length;

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Scholarship discovery" title="Find money you qualify for" description="Local DMV, national and university scholarships, ranked by how well they fit you." />

      {fromProfile && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-foreground">
          <UserRoundCheck className="size-5 text-primary" />
          <p className="flex-1">
            Filters pre-filled from your profile: <strong>{profile.majorField}</strong> and awards open to <strong>{profile.county}</strong> residents.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, provider or keyword"
            className="h-11 rounded-full bg-card pl-10"
            aria-label="Search scholarships"
          />
        </div>
        <div className="flex gap-2">
          <Select value={f.sort} onValueChange={(v) => setF((p) => ({ ...p, sort: v as Filters["sort"] }))}>
            <SelectTrigger className="h-11 w-[170px] rounded-full bg-card" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best match</SelectItem>
              <SelectItem value="deadline">Deadline soonest</SelectItem>
              <SelectItem value="amount">Largest award</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 lg:hidden">
                <SlidersHorizontal /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] overflow-y-auto bg-background">
              <SheetTitle className="mb-5 font-display text-xl">Filters</SheetTitle>
              <FilterPanel f={f} set={set} profile={profile} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Scholarship type">
        {(["all", "local", "national", "university"] as ScopeFilter[]).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={f.scope === s}
            onClick={() => set({ scope: s })}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors",
              f.scope === s ? "bg-ink text-ink-foreground" : "bg-card text-foreground shadow-card hover:bg-secondary",
            )}
          >
            {s === "all" ? "All" : s === "local" ? "Local DMV" : s}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border bg-card/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Filters</h2>
              <button
                onClick={() => {
                  setF(BLANK);
                  setFromProfile(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="size-3" /> Clear all
              </button>
            </div>
            <FilterPanel f={f} set={set} profile={profile} />
            <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => { setF(profileFilters(profile)); setFromProfile(true); }}>
              Reset to my profile
            </Button>
          </div>
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            <strong className="text-foreground">{results.length}</strong> scholarships · <strong className="text-foreground">{eligibleCount}</strong> you fully qualify for
          </p>
          {results.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="No scholarships match these filters"
              action={
                <Button variant="outline" onClick={() => { setF(BLANK); setQuery(""); }}>
                  Clear filters
                </Button>
              }
            >
              Try widening the location or removing the award amount filter.
            </EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {results.map(({ s, m }) => (
                <ScholarshipCard key={s.id} s={s} match={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
