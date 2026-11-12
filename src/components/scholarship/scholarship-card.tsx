import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MatchRing } from "@/components/scholarship/match-ring";
import { ResidencyBadge, ScopeBadge, VerifiedBadge } from "@/components/scholarship/tags";
import { formatMoney, formatShort, relativeLabel } from "@/lib/dates";
import type { MatchResult } from "@/lib/matching";
import { useAppStore } from "@/lib/store/app-store";
import type { Scholarship } from "@/lib/types";
import { cn } from "@/lib/utils";

export function eligibilitySummary(m: MatchResult): { text: string; tone: "success" | "warning" | "destructive" } {
  if (m.unmet.length) return { text: `Doesn't meet ${m.unmet.length} rule${m.unmet.length > 1 ? "s" : ""}: ${(m.unmet[0]?.label ?? "").toLowerCase()}`, tone: "destructive" };
  if (m.verify.length) return { text: `Meets ${m.met.length} of ${m.checks.length} rules · ${m.verify.length} to verify`, tone: "warning" };
  return { text: `Meets all ${m.checks.length} eligibility rules`, tone: "success" };
}

export function SaveButton({ id, compact }: { id: string; compact?: boolean }) {
  const { applications, saveScholarship, removeScholarship } = useAppStore();
  const saved = Boolean(applications[id]);
  return (
    <Button
      variant={saved ? "soft" : "outline"}
      size={compact ? "icon-sm" : "sm"}
      aria-pressed={saved}
      aria-label={saved ? "Remove from tracker" : "Save to tracker"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (saved) {
          removeScholarship(id);
          toast("Removed from your tracker");
        } else {
          saveScholarship(id);
          toast.success("Saved to your tracker", { description: "Find it in the Saved column." });
        }
      }}
    >
      {saved ? <BookmarkCheck /> : <Bookmark />}
      {!compact && (saved ? "Saved" : "Save")}
    </Button>
  );
}

export function ScholarshipCard({ s, match, className }: { s: Scholarship; match: MatchResult; className?: string }) {
  const summary = eligibilitySummary(match);
  const urgent = s.deadlineInDays >= 0 && s.deadlineInDays <= 14;
  return (
    <Link
      to="/scholarships/$id"
      params={{ id: s.id }}
      className={cn(
        "group flex flex-col rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <MatchRing score={match.score} eligible={match.eligible} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            <ScopeBadge s={s} />
            <VerifiedBadge s={s} />
          </div>
          <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary">{s.name}</h3>
          <p className="text-sm text-muted-foreground">{s.provider}</p>
        </div>
        <SaveButton id={s.id} compact />
      </div>

      <p
        className={cn(
          "mt-4 rounded-lg px-3 py-2 text-sm font-medium",
          summary.tone === "success" && "bg-success-soft text-success",
          summary.tone === "warning" && "bg-warning-soft text-warning",
          summary.tone === "destructive" && "bg-destructive-soft text-destructive",
        )}
      >
        {summary.text}
      </p>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Award</p>
          <p className="font-display text-2xl font-bold text-foreground">
            {formatMoney(s.amount)}
            {s.renewable && <span className="ml-1 text-xs font-semibold text-muted-foreground">/ yr</span>}
          </p>
        </div>
        <div className="text-right">
          <p className={cn("inline-flex items-center gap-1 text-sm font-semibold", urgent ? "text-destructive" : "text-foreground")}>
            <CalendarClock className="size-4" /> {formatShort(s.deadlineInDays)}
          </p>
          <p className="text-xs text-muted-foreground">{relativeLabel(s.deadlineInDays)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <ResidencyBadge s={s} />
      </div>
    </Link>
  );
}
