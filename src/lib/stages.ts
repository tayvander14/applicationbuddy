import type { Stage } from "@/lib/types";

export const STAGES: { id: Stage; label: string; bar: string; soft: string; text: string; hint: string }[] = [
  { id: "saved", label: "Saved", bar: "bg-info", soft: "bg-info-soft", text: "text-info", hint: "Scholarships you want to apply for" },
  { id: "in-progress", label: "In Progress", bar: "bg-accent", soft: "bg-accent-soft", text: "text-accent-foreground", hint: "Gathering materials and writing" },
  { id: "submitted", label: "Submitted", bar: "bg-primary", soft: "bg-primary-soft", text: "text-primary", hint: "Waiting to hear back" },
  { id: "awarded", label: "Awarded", bar: "bg-success", soft: "bg-success-soft", text: "text-success", hint: "Money you've won" },
];
