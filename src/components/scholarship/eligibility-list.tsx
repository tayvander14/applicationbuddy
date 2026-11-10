import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";

import type { MatchResult } from "@/lib/matching";
import { cn } from "@/lib/utils";

const GROUPS = [
  { key: "met", title: "You meet", icon: CheckCircle2, tone: "text-success", bg: "bg-success-soft" },
  { key: "verify", title: "Still to verify", icon: CircleHelp, tone: "text-warning", bg: "bg-warning-soft" },
  { key: "unmet", title: "You don't meet", icon: XCircle, tone: "text-destructive", bg: "bg-destructive-soft" },
] as const;

export function EligibilityList({ match }: { match: MatchResult }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GROUPS.map((g) => {
        const items = match[g.key];
        const Icon = g.icon;
        return (
          <section key={g.key} className={cn("rounded-xl p-4", g.bg)} aria-labelledby={`elig-${g.key}`}>
            <h3 id={`elig-${g.key}`} className={cn("mb-3 flex items-center gap-2 font-sans text-sm font-bold", g.tone)}>
              <Icon className="size-4" /> {g.title} ({items.length})
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing here.</p>
            ) : (
              <ul className="space-y-2.5">
                {items.map((c) => (
                  <li key={c.id} className="text-sm">
                    <p className="font-semibold text-foreground">{c.label}</p>
                    <p className="text-muted-foreground">{c.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
