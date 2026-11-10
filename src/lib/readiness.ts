import { DOC_LABELS } from "@/lib/data/scholarships";
import type { DocKey, DocStatus, Scholarship } from "@/lib/types";

export const DOC_STATUS_ORDER: DocStatus[] = ["not-started", "requested", "received", "submitted"];
export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  "not-started": "Not started",
  requested: "Requested",
  received: "Received",
  submitted: "Submitted",
};

export function docItems(s: Scholarship, docs: Partial<Record<DocKey, DocStatus>> | undefined) {
  return s.requiredMaterials.map((key) => ({ key, label: DOC_LABELS[key], status: docs?.[key] ?? ("not-started" as DocStatus) }));
}

/** Share of required materials that are received or submitted (0–100). */
export function readiness(s: Scholarship, docs: Partial<Record<DocKey, DocStatus>> | undefined): number {
  const items = docItems(s, docs);
  if (!items.length) return 100;
  const ready = items.filter((i) => i.status === "received" || i.status === "submitted").length;
  return Math.round((ready / items.length) * 100);
}

/** Incomplete materials within the warning window (R26). */
export function isAtRisk(s: Scholarship, docs: Partial<Record<DocKey, DocStatus>> | undefined, windowDays = 14): boolean {
  return s.deadlineInDays >= 0 && s.deadlineInDays <= windowDays && readiness(s, docs) < 100;
}
