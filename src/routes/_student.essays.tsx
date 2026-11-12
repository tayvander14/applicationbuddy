import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CircleDashed, Eraser, FileText, Lightbulb, Quote, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SCHOLARSHIPS, getScholarship } from "@/lib/data/scholarships";
import { analyzeEssay, CLICHES, SAMPLE_DRAFT } from "@/lib/essay";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/essays")({
  validateSearch: (search: Record<string, unknown>): { s?: string | undefined } => ({
    s: typeof search["s"] === "string" ? search["s"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Essay workspace — Application Buddy" },
      { name: "description", content: "Check your scholarship essay's word count, prompt coverage, donor mission alignment and generic phrases." },
      { property: "og:title", content: "Essay workspace — Application Buddy" },
      { property: "og:description", content: "Check your scholarship essay's word count, prompt coverage, donor mission alignment and generic phrases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Essays,
});

function highlight(text: string): ReactNode[] {
  const phrases = CLICHES.map((c) => c.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${phrases.join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="highlight-cliche text-foreground">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Panel({ title, icon, children, aside }: { title: string; icon: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-foreground [&_svg]:size-4 [&_svg]:text-primary">
          {icon} {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Essays() {
  const { s: sParam } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { applications, essays, setEssay } = useAppStore();
  const trackedIds = Object.keys(applications);
  const selectedId = sParam && getScholarship(sParam) ? sParam : (trackedIds.find((id) => id === "mc-stem-pathways") ?? trackedIds[0] ?? SCHOLARSHIPS[0]!.id);
  const s = getScholarship(selectedId)!;
  const [text, setText] = useState(essays[selectedId] ?? "");
  const [view, setView] = useState<"edit" | "review">("edit");

  useEffect(() => {
    setText(essays[selectedId] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if ((essays[selectedId] ?? "") !== text) setEssay(selectedId, text);
    }, 400);
    return () => clearTimeout(t);
  }, [text, selectedId, essays, setEssay]);

  const a = useMemo(() => analyzeEssay(text, s), [text, s]);
  const pct = Math.min(100, (a.wordCount / s.wordLimit.max) * 100);
  const minPct = (s.wordLimit.min / s.wordLimit.max) * 100;

  const lengthMsg = {
    empty: { tone: "muted", text: `Aim for ${s.wordLimit.min}–${s.wordLimit.max} words.` },
    under: { tone: "warning", text: `${s.wordLimit.min - a.wordCount} words under the minimum.` },
    within: { tone: "success", text: "Within the word limit." },
    over: { tone: "destructive", text: `${a.wordCount - s.wordLimit.max} words over the limit — this can disqualify an essay.` },
  }[a.lengthStatus];

  const tracked = SCHOLARSHIPS.filter((x) => applications[x.id]);
  const others = SCHOLARSHIPS.filter((x) => !applications[x.id]);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Essay workspace"
        title="Make your essay unmistakably yours"
        description={
          <span className="inline-flex items-start gap-1.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Feedback only — Application Buddy will never write or rewrite your essay.
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <Label htmlFor="essay-scholarship" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Linked scholarship
            </Label>
            <Select value={selectedId} onValueChange={(v) => navigate({ search: { s: v } })}>
              <SelectTrigger id="essay-scholarship" className="mt-1.5 h-11 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tracked.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>In your tracker</SelectLabel>
                    {tracked.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                <SelectGroup>
                  <SelectLabel>Other scholarships</SelectLabel>
                  {others.map((x) => (
                    <SelectItem key={x.id} value={x.id}>
                      {x.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="mt-4 rounded-xl bg-accent-soft p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-foreground">Prompt · {s.wordLimit.min}–{s.wordLimit.max} words</p>
              <p className="mt-1 text-foreground">{s.essayPrompt}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                <strong className="text-foreground">Donor mission:</strong> {s.mission}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
              <div className="inline-flex rounded-full bg-muted p-1" role="tablist" aria-label="Essay view">
                {(["edit", "review"] as const).map((v) => (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={view === v}
                    onClick={() => setView(v)}
                    className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
                  >
                    {v === "edit" ? "Write" : `Highlights${a.cliches.length ? ` (${a.cliches.length})` : ""}`}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE_DRAFT)}>
                  <FileText /> Load sample draft
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setText("")} disabled={!text}>
                  <Eraser /> Clear
                </Button>
              </div>
            </div>
            {view === "edit" ? (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your essay draft here…"
                aria-label="Essay draft"
                className="min-h-[420px] resize-y rounded-none border-0 p-5 text-base leading-relaxed shadow-none focus-visible:ring-0"
              />
            ) : (
              <div className="min-h-[420px] whitespace-pre-wrap p-5 text-base leading-relaxed text-foreground">
                {text ? highlight(text) : <span className="text-muted-foreground">Nothing to review yet.</span>}
              </div>
            )}
            <div className="border-t p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-foreground" aria-live="polite">
                  {a.wordCount} words
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    lengthMsg.tone === "success" && "text-success",
                    lengthMsg.tone === "warning" && "text-warning",
                    lengthMsg.tone === "destructive" && "text-destructive",
                    lengthMsg.tone === "muted" && "text-muted-foreground",
                  )}
                >
                  {lengthMsg.text}
                </span>
              </div>
              <div className="relative mt-2 h-2 rounded-full bg-muted" aria-hidden="true">
                <div
                  className={cn("h-2 rounded-full transition-all", a.lengthStatus === "over" ? "bg-destructive" : a.lengthStatus === "within" ? "bg-success" : "bg-accent")}
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute -top-1 h-4 w-0.5 bg-foreground/40" style={{ left: `${minPct}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span style={{ marginLeft: `calc(${minPct}% - 1.5rem)` }}>min {s.wordLimit.min}</span>
                <span>max {s.wordLimit.max}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {a.wordCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-input bg-card/70 p-8 text-center">
              <Lightbulb className="mx-auto size-8 text-accent-foreground" />
              <h3 className="mt-2 text-lg font-bold text-foreground">Feedback appears as you write</h3>
              <p className="mt-1 text-sm text-muted-foreground">Paste a draft or load the sample to see how it works.</p>
            </div>
          ) : (
            <>
              <Panel title="Prompt requirements" icon={<CheckCircle2 />} aside={<Badge variant={a.requirements.every((r) => r.met) ? "success" : "warning"}>{a.requirements.filter((r) => r.met).length}/{a.requirements.length}</Badge>}>
                <ul className="space-y-2">
                  {a.requirements.map((r) => (
                    <li key={r.label} className="flex items-start gap-2 text-sm">
                      {r.met ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                      <span className="text-foreground">
                        {r.label}
                        {!r.met && <span className="block text-xs text-muted-foreground">Not found yet — reviewers may flag this as off-prompt.</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Donor mission alignment" icon={<ShieldCheck />}>
                <ul className="space-y-2">
                  {a.themes.map((t) => (
                    <li key={t.theme} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <span className="font-semibold text-foreground">{t.theme}</span>
                      <Badge variant={t.status === "present" ? "success" : t.status === "underrepresented" ? "warning" : "destructive"}>
                        {t.status === "present" ? "Present" : t.status === "underrepresented" ? "Underrepresented" : "Missing"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel
                title="Generic phrases"
                icon={<AlertTriangle />}
                aside={<Badge variant={a.cliches.length ? "warning" : "success"}>{a.cliches.length ? `${a.cliches.length} found` : "None"}</Badge>}
              >
                {a.cliches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No overused phrases detected. 🎉</p>
                ) : (
                  <ul className="space-y-3">
                    {a.cliches.map((c) => (
                      <li key={c.phrase} className="text-sm">
                        <p className="font-semibold text-foreground">
                          <mark className="highlight-cliche">"{c.phrase}"</mark>
                          {c.count > 1 && <span className="ml-1 text-xs text-muted-foreground">×{c.count}</span>}
                        </p>
                        <p className="mt-0.5 text-muted-foreground">{c.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              {a.detailPrompts.length > 0 && (
                <Panel title="Add specific personal details" icon={<Quote />}>
                  <p className="mb-2 text-xs text-muted-foreground">Committees often spend 60–90 seconds per essay. Specifics make you memorable.</p>
                  <ul className="space-y-2">
                    {a.detailPrompts.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                        <CircleDashed className="mt-0.5 size-4 shrink-0 text-primary" /> {p}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
