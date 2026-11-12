import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, GripVertical, MoreHorizontal, Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { getScholarship } from "@/lib/data/scholarships";
import { formatMoney, formatShort, relativeLabel } from "@/lib/dates";
import { readiness } from "@/lib/readiness";
import { useAppStore } from "@/lib/store/app-store";
import { STAGES } from "@/lib/stages";
import type { Scholarship, Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/tracker")({
  head: () => ({
    meta: [
      { title: "Application tracker — Application Buddy" },
      {
        name: "description",
        content: "Drag scholarship applications between Saved, In Progress, Submitted and Awarded.",
      },
      { property: "og:title", content: "Application tracker — Application Buddy" },
      {
        property: "og:description",
        content: "Drag scholarship applications between Saved, In Progress, Submitted and Awarded.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tracker,
});

function CardBody({ s, stage, dragging }: { s: Scholarship; stage: Stage; dragging?: boolean }) {
  const { docs } = useAppStore();
  const r = readiness(s, docs[s.id]);
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-card",
        dragging && "rotate-2 shadow-lift ring-2 ring-primary",
      )}
    >
      <p className="font-semibold leading-snug text-foreground">{s.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{s.provider}</p>
      <div className="mt-3 flex flex-col gap-0.5 text-sm">
        <span className="font-display font-bold text-foreground">{formatMoney(s.amount)}</span>
        {stage !== "awarded" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              s.deadlineInDays >= 0 && s.deadlineInDays <= 14
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            <CalendarClock className="size-3.5" /> {formatShort(s.deadlineInDays)} ·{" "}
            {relativeLabel(s.deadlineInDays)}
          </span>
        )}
      </div>
      {(stage === "saved" || stage === "in-progress") && (
        <div className="mt-3 flex items-center gap-2">
          <Progress value={r} className="h-1.5 flex-1" aria-label={`${r}% of materials ready`} />
          <span className="text-xs text-muted-foreground">{r}%</span>
        </div>
      )}
    </div>
  );
}

function DraggableCard({ s, stage }: { s: Scholarship; stage: Stage }) {
  const { moveApplication, removeScholarship } = useAppStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: s.id,
    data: { stage },
  });
  return (
    <div ref={setNodeRef} className={cn("group relative", isDragging && "opacity-40")}>
      <div className="flex">
        <button
          {...listeners}
          {...attributes}
          aria-label={`Drag ${s.name}`}
          className="absolute left-0 top-0 z-10 flex h-full w-6 cursor-grab touch-none items-center justify-center rounded-l-xl text-muted-foreground opacity-60 hover:bg-muted hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <Link to="/scholarships/$id" params={{ id: s.id }} className="block flex-1 pl-4">
          <CardBody s={s} stage={stage} />
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 top-1.5"
            aria-label={`Options for ${s.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {STAGES.filter((x) => x.id !== stage).map((x) => (
            <DropdownMenuItem
              key={x.id}
              onSelect={() => {
                moveApplication(s.id, x.id);
                toast.success(`Moved to ${x.label}`, { description: s.name });
              }}
            >
              <span className={cn("mr-2 size-2 rounded-full", x.bar)} /> {x.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => {
              removeScholarship(s.id);
              toast("Removed from tracker", { description: s.name });
            }}
          >
            Remove from tracker
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Column({ stage, items }: { stage: (typeof STAGES)[number]; items: Scholarship[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = items.reduce((sum, s) => sum + s.amount, 0);
  return (
    <section
      ref={setNodeRef}
      aria-label={`${stage.label} column`}
      className={cn(
        "flex min-h-[320px] flex-col rounded-2xl border-2 border-transparent bg-muted/70 p-3 transition-colors",
        isOver && "border-primary bg-primary-soft",
      )}
    >
      <header className="mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", stage.bar)} />
          <h2 className="font-sans text-sm font-bold text-foreground">{stage.label}</h2>
          <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {items.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length ? formatMoney(total) : stage.hint}
        </p>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {items.map((s) => (
          <DraggableCard key={s.id} s={s} stage={stage.id} />
        ))}
        {items.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-input p-4 text-center text-xs text-muted-foreground">
            Drag a card here
          </div>
        )}
      </div>
    </section>
  );
}

const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length ? hits : rectIntersection(args);
};

function Tracker() {
  const { applications, moveApplication } = useAppStore();
  const dndId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byStage = (stage: Stage) =>
    Object.entries(applications)
      .filter(([, st]) => st === stage)
      .map(([id]) => getScholarship(id))
      .filter((s): s is Scholarship => Boolean(s))
      .sort((a, b) => a.deadlineInDays - b.deadlineInDays);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const to = e.over?.id as Stage | undefined;
    const id = String(e.active.id);
    if (!to || applications[id] === to) return;
    moveApplication(id, to);
    const label = STAGES.find((x) => x.id === to)!.label;
    if (to === "awarded")
      toast.success("Congratulations! 🎉", {
        description: `${getScholarship(id)?.name} marked as awarded.`,
      });
    else toast.success(`Moved to ${label}`, { description: getScholarship(id)?.name });
  };

  const active = activeId ? getScholarship(activeId) : null;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Application tracker"
        title="Your applications, at a glance"
        description="Drag a card by its handle to move it, or use the ⋯ menu. Changes save instantly."
        actions={
          <Button asChild variant="outline">
            <Link to="/scholarships">
              <Plus /> Add scholarships
            </Link>
          </Button>
        }
      />
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={collision}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((st) => (
            <Column key={st.id} stage={st} items={byStage(st.id)} />
          ))}
        </div>
        <DragOverlay>
          {active ? (
            <CardBody s={active} stage={applications[active.id] ?? "saved"} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
