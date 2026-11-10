import { cn } from "@/lib/utils";

export function MatchRing({ score, size = "md", eligible = true }: { score: number; size?: "sm" | "md" | "lg"; eligible?: boolean }) {
  const dims = { sm: 44, md: 60, lg: 96 }[size];
  const stroke = { sm: 5, md: 6, lg: 9 }[size];
  const r = (dims - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = !eligible ? "stroke-destructive" : score >= 80 ? "stroke-success" : "stroke-accent";
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: dims, height: dims }} role="img" aria-label={`Match score ${score} out of 100`}>
      <svg width={dims} height={dims} className="-rotate-90">
        <circle cx={dims / 2} cy={dims / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-muted" />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className={cn(tone, "transition-[stroke-dashoffset] duration-700")}
        />
      </svg>
      <span className={cn("absolute font-display font-bold text-foreground", size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-xs")}>
        {score}
        {size === "lg" && <span className="text-sm text-muted-foreground">%</span>}
      </span>
    </div>
  );
}
