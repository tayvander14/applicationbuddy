import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertTriangle,
  BellRing,
  CalendarPlus,
  CheckCircle2,
  CalendarX2,
  Flag,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { getScholarship } from "@/lib/data/scholarships";
import { deadlineDate, formatMoney, formatShort, relativeLabel } from "@/lib/dates";
import { DOC_STATUS_LABEL, DOC_STATUS_ORDER, docItems, isAtRisk, readiness } from "@/lib/readiness";
import { useAppStore } from "@/lib/store/app-store";
import type { DocStatus, Scholarship } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/deadlines")({
  head: () => ({
    meta: [
      { title: "Deadlines & documents — Application Buddy" },
      {
        name: "description",
        content:
          "A timeline of every scholarship deadline plus a checklist for essays, transcripts, letters and FAFSA materials.",
      },
      { property: "og:title", content: "Deadlines & documents — Application Buddy" },
      {
        property: "og:description",
        content:
          "A timeline of every scholarship deadline plus a checklist for essays, transcripts, letters and FAFSA materials.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Deadlines,
});

interface Milestone {
  key: string;
  inDays: number;
  label: string;
  s: Scholarship;
  kind: "deadline" | "milestone";
}

const STATUS_STYLE: Record<DocStatus, string> = {
  "not-started": "bg-card text-muted-foreground",
  requested: "bg-info text-info-foreground",
  received: "bg-accent text-accent-foreground",
  submitted: "bg-success text-success-foreground",
};

function exportToCalendar(target: "Google Calendar" | "Apple Calendar", what: string) {
  toast.success(`Added to ${target} (simulated)`, {
    description: `${what} — calendar sync arrives in a later version.`,
  });
}

function Deadlines() {
  const { applications, docs, setDocStatus, reminders, setReminders } = useAppStore();
  const active = Object.entries(applications)
    .filter(([, st]) => st === "saved" || st === "in-progress")
    .map(([id]) => getScholarship(id))
    .filter((s): s is Scholarship => Boolean(s))
    .sort((a, b) => a.deadlineInDays - b.deadlineInDays);

  const milestones: Milestone[] = active
    .flatMap((s) => {
      const list: Milestone[] = [
        {
          key: s.id + "-d",
          inDays: s.deadlineInDays,
          label: "Application due",
          s,
          kind: "deadline",
        },
      ];
      if (s.requiredMaterials.includes("recommendation") && s.deadlineInDays - 14 >= 0)
        list.push({
          key: s.id + "-r",
          inDays: s.deadlineInDays - 14,
          label: "Ask for recommendation letter",
          s,
          kind: "milestone",
        });
      if (s.requiredMaterials.includes("transcript") && s.deadlineInDays - 10 >= 0)
        list.push({
          key: s.id + "-t",
          inDays: s.deadlineInDays - 10,
          label: "Request transcript from counselor",
          s,
          kind: "milestone",
        });
      if (s.deadlineInDays - 3 >= 0)
        list.push({
          key: s.id + "-e",
          inDays: s.deadlineInDays - 3,
          label: "Final essay read-through",
          s,
          kind: "milestone",
        });
      return list;
    })
    .filter((m) => m.inDays >= 0)
    .sort((a, b) => a.inDays - b.inDays);

  const months = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    const key = format(deadlineDate(m.inDays), "MMMM yyyy");
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Deadlines & documents"
        title="Stay ahead of every deadline"
        description="One timeline across every portal, and a checklist for each application's materials."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <CalendarPlus /> Export all deadlines
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => exportToCalendar("Google Calendar", `${active.length} deadlines`)}
              >
                Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => exportToCalendar("Apple Calendar", `${active.length} deadlines`)}
              >
                Apple Calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-foreground">
          <BellRing className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Deadline reminders</p>
          <p className="text-sm text-muted-foreground">
            Email and push reminders 14, 7 and 2 days before each deadline (simulated in this
            prototype).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              toast("Sample reminder", {
                description:
                  "Montgomery County STEM Pathways is due soon. 2 materials still need attention.",
                icon: <Mail className="size-4" />,
              })
            }
          >
            Preview
          </Button>
          <Switch
            checked={reminders}
            onCheckedChange={(v) => {
              setReminders(v);
              toast(v ? "Reminders turned on" : "Reminders turned off");
            }}
            aria-label="Deadline reminders"
          />
        </div>
      </div>

      {active.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 />}
          title="No active applications yet"
          action={
            <Button asChild>
              <Link to="/scholarships">Find scholarships</Link>
            </Button>
          }
        >
          Save a scholarship and its deadline and checklist will show up here.
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section
            aria-labelledby="timeline-heading"
            className="rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-6 lg:self-start"
          >
            <h2 id="timeline-heading" className="mb-4 text-xl font-bold text-foreground">
              Timeline
            </h2>
            <div className="space-y-6">
              {Object.entries(months).map(([month, items]) => (
                <div key={month}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {month}
                  </p>
                  <ol className="relative space-y-4 border-l-2 border-border pl-5">
                    {items.map((m) => {
                      const risk = m.kind === "deadline" && isAtRisk(m.s, docs[m.s.id]);
                      return (
                        <li key={m.key} className="relative">
                          <span
                            className={cn(
                              "absolute -left-[27px] top-1 flex size-3.5 items-center justify-center rounded-full ring-4 ring-card",
                              m.kind === "deadline"
                                ? risk
                                  ? "bg-destructive"
                                  : "bg-primary"
                                : "bg-accent",
                            )}
                          />
                          <p className="text-xs font-semibold text-muted-foreground">
                            {formatShort(m.inDays)} ·{" "}
                            {m.inDays === 0 ? "today" : `in ${m.inDays} days`}
                          </p>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              m.kind === "deadline" ? "text-foreground" : "text-foreground/80",
                            )}
                          >
                            {m.kind === "deadline" && (
                              <Flag className="mr-1 inline size-3.5 text-primary" />
                            )}
                            {m.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.s.name}</p>
                          {risk && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                              <AlertTriangle className="size-3" /> Materials incomplete
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="check-heading" className="space-y-4">
            <h2 id="check-heading" className="text-xl font-bold text-foreground">
              Document checklist
            </h2>
            {active.map((s) => {
              const items = docItems(s, docs[s.id]);
              const r = readiness(s, docs[s.id]);
              const risk = isAtRisk(s, docs[s.id]);
              return (
                <article
                  key={s.id}
                  className={cn(
                    "rounded-2xl border bg-card p-5 shadow-card",
                    risk && "border-destructive/40",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to="/scholarships/$id"
                        params={{ id: s.id }}
                        className="font-display text-lg font-bold text-foreground hover:text-primary"
                      >
                        {s.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(s.amount)} · Due {formatShort(s.deadlineInDays)} (
                        {relativeLabel(s.deadlineInDays).toLowerCase()}) · {s.portal}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <CalendarPlus /> Add to calendar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => exportToCalendar("Google Calendar", s.name)}
                        >
                          Google Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => exportToCalendar("Apple Calendar", s.name)}
                        >
                          Apple Calendar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={r} className="h-2 flex-1" aria-label={`${r}% ready`} />
                    <span className="text-sm font-bold text-foreground">{r}% ready</span>
                  </div>
                  {risk && (
                    <p
                      role="alert"
                      className="mt-3 flex items-center gap-2 rounded-lg bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive"
                    >
                      <AlertTriangle className="size-4" /> Due in {s.deadlineInDays} days with{" "}
                      {(() => {
                        const n = items.filter(
                          (i) => i.status === "not-started" || i.status === "requested",
                        ).length;
                        return `${n} ${n === 1 ? "item" : "items"}`;
                      })()}{" "}
                      still outstanding.
                    </p>
                  )}
                  {r === 100 && (
                    <p className="mt-3 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success">
                      <CheckCircle2 className="size-4" /> All materials in — ready to submit!
                    </p>
                  )}

                  <ul className="mt-4 divide-y">
                    {items.map((item) => (
                      <li
                        key={item.key}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-sm font-semibold text-foreground">{item.label}</span>
                        <div
                          role="radiogroup"
                          aria-label={`${item.label} status`}
                          className="inline-flex rounded-full bg-muted p-1"
                        >
                          {DOC_STATUS_ORDER.map((st) => (
                            <button
                              key={st}
                              role="radio"
                              aria-checked={item.status === st}
                              onClick={() => setDocStatus(s.id, item.key, st)}
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                                item.status === st
                                  ? STATUS_STYLE[st] + " shadow-sm"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {DOC_STATUS_LABEL[st]}
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}
