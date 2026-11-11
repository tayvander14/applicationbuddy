import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Bot, CalendarClock, ExternalLink, FileText, Landmark, Layers, PenLine, ShieldQuestion, Users, Wallet } from "lucide-react";

import { EligibilityList } from "@/components/scholarship/eligibility-list";
import { MatchRing } from "@/components/scholarship/match-ring";
import { SaveButton } from "@/components/scholarship/scholarship-card";
import { ResidencyBadge, ScopeBadge, VerifiedBadge } from "@/components/scholarship/tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOC_LABELS, getScholarship } from "@/lib/data/scholarships";
import { formatDeadline, formatMoney, formatVerified, relativeLabel } from "@/lib/dates";
import { evaluateMatch } from "@/lib/matching";
import { DOC_STATUS_LABEL } from "@/lib/readiness";
import { useAppStore } from "@/lib/store/app-store";
import { STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/scholarships/$id")({
  loader: ({ params }) => {
    const s = getScholarship(params.id);
    if (!s) throw notFound();
    return { name: s.name, summary: s.summary };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Application Buddy` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.name} — Application Buddy` },
          { property: "og:description", content: loaderData.summary },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Scholarship unavailable — Application Buddy" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold text-foreground">Scholarship not found</h1>
      <p className="mt-2 text-muted-foreground">It may have been removed or the link is wrong.</p>
      <Button asChild className="mt-6">
        <Link to="/scholarships">Back to discovery</Link>
      </Button>
    </div>
  ),
  component: Detail,
});

const STACKING_LABEL = { allowed: "Stacks with other aid", limited: "Limited stacking", "not-allowed": "Does not stack" } as const;

function Detail() {
  const { id } = Route.useParams();
  const s = getScholarship(id)!;
  const { profile, applications, docs } = useAppStore();
  const match = evaluateMatch(profile, s);
  const stage = applications[s.id];
  const stageInfo = STAGES.find((x) => x.id === stage);

  return (
    <div className="animate-rise">
      <Link to="/scholarships" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All scholarships
      </Link>

      <header className="rounded-3xl border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <ScopeBadge s={s} />
              <VerifiedBadge s={s} />
              <ResidencyBadge s={s} />
              {s.applicantPool === "small" && <Badge variant="muted"><Users /> Small applicant pool</Badge>}
              {stageInfo && <Badge className={cn(stageInfo.soft, stageInfo.text)}>{stageInfo.label}</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{s.name}</h1>
            <p className="mt-1 text-muted-foreground">Offered by {s.provider}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Award</p>
                <p className="font-display text-2xl font-bold text-foreground">{formatMoney(s.amount)}</p>
                <p className="text-xs text-muted-foreground">{s.renewable ? "Renewable each year" : "One-time award"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deadline</p>
                <p className="font-display text-2xl font-bold text-foreground">{formatDeadline(s.deadlineInDays)}</p>
                <p className={cn("text-xs", s.deadlineInDays <= 14 ? "font-semibold text-destructive" : "text-muted-foreground")}>{relativeLabel(s.deadlineInDays)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Apply through</p>
                <p className="font-semibold text-foreground">{s.portal}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4 rounded-2xl bg-muted/60 p-5 md:w-60 md:flex-col md:text-center">
            <MatchRing score={match.score} size="lg" eligible={match.eligible} />
            <div>
              <p className="font-display text-lg font-bold text-foreground">
                {match.fullyEligible ? "Fully eligible" : match.eligible ? "Likely eligible" : "Not eligible"}
              </p>
              <p className="text-xs text-muted-foreground">Compatibility score</p>
              <div className="mt-3 flex flex-wrap gap-2 md:justify-center">
                <SaveButton id={s.id} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-2xl font-bold text-foreground">Why you got this score</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          We checked {match.checks.length} eligibility rules against your profile
          {match.preferenceMatches.length > 0 && <> and found shared interests in {match.preferenceMatches.join(", ")}</>}.
        </p>
        <EligibilityList match={match} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-foreground"><PenLine className="size-5 text-primary" /> Essay prompt</h2>
            <p className="text-xs text-muted-foreground">{s.wordLimit.min}–{s.wordLimit.max} words</p>
            <blockquote className="mt-3 border-l-4 border-accent pl-4 text-foreground">{s.essayPrompt}</blockquote>
            <p className="mt-4 text-sm text-muted-foreground"><strong className="text-foreground">Donor mission:</strong> {s.mission}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/essays" search={{ s: s.id }}>Open in essay workspace</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/assistant" search={{ s: s.id }}>
                  <Bot /> Ask about this award
                </Link>
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"><FileText className="size-5 text-primary" /> Required materials</h2>
            <ul className="space-y-2">
              {s.requiredMaterials.map((k) => {
                const st = docs[s.id]?.[k];
                return (
                  <li key={k} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-2.5 text-sm">
                    <span className="font-semibold text-foreground">{DOC_LABELS[k]}</span>
                    {stage ? (
                      <span className="text-xs font-semibold text-muted-foreground">{DOC_STATUS_LABEL[st ?? "not-started"]}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Required</span>
                    )}
                  </li>
                );
              })}
            </ul>
            {stage && (
              <Button asChild variant="link" className="mt-2 px-0">
                <Link to="/deadlines">Update checklist →</Link>
              </Button>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 text-xl font-bold text-foreground">Award policy</h2>
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Wallet className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold text-foreground">Disbursement</dt>
                  <dd className="text-muted-foreground">{s.disbursement === "student" ? "Paid directly to the student" : "Paid directly to the university"}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Layers className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold text-foreground">{STACKING_LABEL[s.stacking]}</dt>
                  <dd className="text-muted-foreground">{s.stackingNote}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold text-foreground">Renewal</dt>
                  <dd className="text-muted-foreground">{s.renewable ? "Renewable if you keep meeting the requirements." : "One-time award."}</dd>
                </div>
              </div>
            </dl>
          </section>

          <section className={cn("rounded-2xl border p-6", s.verified ? "border-success/30 bg-success-soft" : "border-warning/30 bg-warning-soft")}>
            <h2 className={cn("mb-3 flex items-center gap-2 text-xl font-bold", s.verified ? "text-success" : "text-warning")}>
              {s.verified ? <BadgeCheck className="size-5" /> : <ShieldQuestion className="size-5" />}
              {s.verified ? "Verified listing" : "Pending verification"}
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-foreground">Source</dt>
                <dd className="text-muted-foreground">{s.source}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">{s.verified ? "Last verified" : "Last checked"}</dt>
                <dd className="text-muted-foreground">{formatVerified(s.lastVerifiedDaysAgo)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Provider</dt>
                <dd className="flex items-center gap-1 text-muted-foreground"><Landmark className="size-3.5" /> {s.provider}</dd>
              </div>
            </dl>
            {!s.verified && <p className="mt-3 text-sm text-foreground">Double-check the details with the provider before you apply.</p>}
            <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground"><ExternalLink className="size-3" /> Provider link unavailable in this prototype</p>
          </section>
        </div>
      </div>
    </div>
  );
}
