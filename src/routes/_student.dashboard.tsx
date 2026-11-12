import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  FileWarning,
  PenLine,
  Search,
  Trophy,
  UserRound,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ScholarshipCard } from "@/components/scholarship/scholarship-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SCHOLARSHIPS, getScholarship } from "@/lib/data/scholarships";
import { formatMoney, formatShort, relativeLabel } from "@/lib/dates";
import { rankScholarships } from "@/lib/matching";
import { DOC_STATUS_LABEL, docItems, isAtRisk, readiness } from "@/lib/readiness";
import { useAppStore } from "@/lib/store/app-store";
import { STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Application Buddy" },
      {
        name: "description",
        content:
          "Your recommended scholarships, upcoming deadlines, missing materials and application progress.",
      },
      { property: "og:title", content: "Dashboard — Application Buddy" },
      {
        property: "og:description",
        content:
          "Your recommended scholarships, upcoming deadlines, missing materials and application progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  sub?: string | undefined;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className={cn("mb-3 flex size-10 items-center justify-center rounded-xl", tone)}>
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Dashboard() {
  const { profile, applications, docs } = useAppStore();
  const tracked = Object.entries(applications)
    .map(([id, stage]) => ({ s: getScholarship(id)!, stage }))
    .filter((t) => t.s);
  const active = tracked.filter((t) => t.stage === "saved" || t.stage === "in-progress");
  const potential = tracked
    .filter((t) => t.stage !== "awarded")
    .reduce((sum, t) => sum + t.s.amount, 0);
  const won = tracked.filter((t) => t.stage === "awarded").reduce((sum, t) => sum + t.s.amount, 0);
  const upcoming = tracked
    .filter((t) => t.s.deadlineInDays >= 0 && t.stage !== "awarded")
    .sort((a, b) => a.s.deadlineInDays - b.s.deadlineInDays);
  const atRisk = active.filter((t) => isAtRisk(t.s, docs[t.s.id]));
  const missing = active
    .flatMap((t) =>
      docItems(t.s, docs[t.s.id])
        .filter((d) => d.status === "not-started" || d.status === "requested")
        .map((d) => ({ ...d, s: t.s })),
    )
    .sort((a, b) => a.s.deadlineInDays - b.s.deadlineInDays);
  const recommended = rankScholarships(profile, SCHOLARSHIPS)
    .filter(
      (r) =>
        r.match.eligible && !applications[r.scholarship.id] && r.scholarship.deadlineInDays >= 0,
    )
    .slice(0, 3);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={`${profile.gradeLevel} grade · ${profile.school || profile.county}`}
        title={`Hi, ${profile.firstName || "there"} 👋`}
        description="Here's where your scholarship search stands today."
        actions={
          <Button asChild>
            <Link to="/scholarships">
              <Search /> Find scholarships
            </Link>
          </Button>
        }
      />

      {atRisk.length > 0 && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center"
        >
          <AlertTriangle className="size-5 shrink-0 text-warning" />
          <p className="flex-1 text-sm text-foreground">
            <strong>
              {atRisk.length} application{atRisk.length > 1 ? "s are" : " is"} due within 14 days
            </strong>{" "}
            and still missing materials: {atRisk.map((t) => t.s.name).join(", ")}.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/deadlines">Review checklist</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={Wallet}
          label="Potential awards"
          value={formatMoney(potential)}
          sub={`${tracked.filter((t) => t.stage !== "awarded").length} open applications`}
          tone="bg-primary-soft text-primary"
        />
        <Stat
          icon={Trophy}
          label="Awarded so far"
          value={formatMoney(won)}
          sub="Congrats!"
          tone="bg-success-soft text-success"
        />
        <Stat
          icon={CalendarClock}
          label="Next deadline"
          value={upcoming[0] ? formatShort(upcoming[0].s.deadlineInDays) : "—"}
          sub={upcoming[0]?.s.name}
          tone="bg-accent-soft text-accent-foreground"
        />
        <Stat
          icon={FileWarning}
          label="Materials to finish"
          value={String(missing.length)}
          sub={`across ${active.length} active applications`}
          tone="bg-destructive-soft text-destructive"
        />
      </div>

      <section className="mt-10" aria-labelledby="rec-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="rec-heading" className="text-2xl font-bold text-foreground">
              Recommended for you
            </h2>
            <p className="text-sm text-muted-foreground">
              Ranked by your profile: {profile.county}, {profile.gpa.toFixed(2)} GPA,{" "}
              {profile.majorField}.
            </p>
          </div>
          <Link
            to="/scholarships"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
          >
            See all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommended.map(({ scholarship, match }) => (
            <ScholarshipCard key={scholarship.id} s={scholarship} match={match} />
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section
          className="rounded-2xl border bg-card p-5 shadow-card sm:p-6"
          aria-labelledby="deadlines-heading"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="deadlines-heading" className="text-xl font-bold text-foreground">
              Approaching deadlines
            </h2>
            <Link to="/deadlines" className="text-sm font-semibold text-primary hover:underline">
              Timeline
            </Link>
          </div>
          <ul className="divide-y">
            {upcoming.slice(0, 5).map(({ s, stage }) => {
              const r = readiness(s, docs[s.id]);
              return (
                <li key={s.id} className="flex items-center gap-4 py-3">
                  <div className="w-14 shrink-0 rounded-xl bg-muted py-1.5 text-center">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">
                      {formatShort(s.deadlineInDays).split(" ")[0]}
                    </p>
                    <p className="font-display text-xl font-bold leading-none text-foreground">
                      {formatShort(s.deadlineInDays).split(" ")[1]}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/scholarships/$id"
                      params={{ id: s.id }}
                      className="block truncate font-semibold text-foreground hover:text-primary"
                    >
                      {s.name}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress
                        value={r}
                        className="h-1.5 flex-1"
                        aria-label={`${r}% of materials ready`}
                      />
                      <span className="w-20 text-right text-xs text-muted-foreground">
                        {r}% ready
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "hidden text-xs font-semibold sm:block",
                      s.deadlineInDays <= 14 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {stage === "submitted" ? "Submitted" : relativeLabel(s.deadlineInDays)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="rounded-2xl border bg-card p-5 shadow-card sm:p-6"
          aria-labelledby="progress-heading"
        >
          <h2 id="progress-heading" className="mb-4 text-xl font-bold text-foreground">
            Application progress
          </h2>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            {STAGES.map((st) => {
              const n = tracked.filter((t) => t.stage === st.id).length;
              return n ? (
                <div
                  key={st.id}
                  className={st.bar}
                  style={{ width: `${(n / tracked.length) * 100}%` }}
                />
              ) : null;
            })}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {STAGES.map((st) => (
              <li key={st.id} className="flex items-center gap-2 text-sm">
                <span className={cn("size-2.5 rounded-full", st.bar)} />
                <span className="text-muted-foreground">{st.label}</span>
                <span className="ml-auto font-bold text-foreground">
                  {tracked.filter((t) => t.stage === st.id).length}
                </span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link to="/tracker">Open tracker</Link>
          </Button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section
          className="rounded-2xl border bg-card p-5 shadow-card sm:p-6"
          aria-labelledby="missing-heading"
        >
          <h2 id="missing-heading" className="mb-4 text-xl font-bold text-foreground">
            Incomplete materials
          </h2>
          {missing.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Everything for your active applications is in. Nice work!
            </p>
          ) : (
            <ul className="space-y-2">
              {missing.slice(0, 6).map((m) => (
                <li
                  key={m.s.id + m.key}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{m.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.s.name}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                      m.status === "requested"
                        ? "bg-info-soft text-info"
                        : "bg-card text-muted-foreground",
                    )}
                  >
                    {DOC_STATUS_LABEL[m.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="rounded-2xl bg-ink-gradient p-5 text-ink-foreground shadow-lift sm:p-6"
          aria-labelledby="quick-heading"
        >
          <h2 id="quick-heading" className="mb-4 text-xl font-bold">
            Quick actions
          </h2>
          <div className="grid gap-2">
            {[
              { to: "/essays" as const, icon: PenLine, label: "Get feedback on an essay" },
              { to: "/assistant" as const, icon: Bot, label: "Ask the verified assistant" },
              {
                to: "/deadlines" as const,
                icon: CalendarClock,
                label: "Update document checklist",
              },
              { to: "/onboarding" as const, icon: UserRound, label: "Update my profile" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-xl bg-ink-foreground/10 px-4 py-3 text-sm font-semibold transition-colors hover:bg-ink-foreground/20"
              >
                <a.icon className="size-4 text-accent" /> {a.label}
                <ArrowRight className="ml-auto size-4 opacity-60" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
