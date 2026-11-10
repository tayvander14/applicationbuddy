import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-9", className)}>
      <rect width="40" height="40" rx="12" className="fill-primary" />
      <path d="M12 9h16a2 2 0 0 1 2 2v20.5l-10-5.5-10 5.5V11a2 2 0 0 1 2-2Z" className="fill-primary-foreground" />
      <path d="m15.5 17.5 3.2 3.2 6-6.2" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
      <circle cx="31" cy="9" r="4" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("font-display text-lg font-bold leading-none tracking-tight", tone === "inverse" ? "text-sidebar-foreground" : "text-foreground")}>
        Application<span className={tone === "inverse" ? "text-sidebar-primary" : "text-primary"}> Buddy</span>
      </span>
    </span>
  );
}
