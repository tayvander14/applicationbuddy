import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";

export function deadlineDate(inDays: number): Date {
  return addDays(startOfDay(new Date()), inDays);
}

export function daysUntil(inDays: number): number {
  return differenceInCalendarDays(deadlineDate(inDays), startOfDay(new Date()));
}

export function formatDeadline(inDays: number): string {
  return format(deadlineDate(inDays), "MMM d, yyyy");
}

export function formatShort(inDays: number): string {
  return format(deadlineDate(inDays), "MMM d");
}

export function relativeLabel(inDays: number): string {
  if (inDays < 0) return "Closed";
  if (inDays === 0) return "Due today";
  if (inDays === 1) return "Due tomorrow";
  return `${inDays} days left`;
}

export function formatVerified(daysAgo: number): string {
  return format(addDays(startOfDay(new Date()), -daysAgo), "MMM d, yyyy");
}

export function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
