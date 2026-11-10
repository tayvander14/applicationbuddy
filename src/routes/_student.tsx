import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarRange,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  Search,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student")({
  component: StudentLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scholarships", label: "Discover", icon: Search },
  { to: "/tracker", label: "Tracker", icon: KanbanSquare },
  { to: "/deadlines", label: "Deadlines & docs", icon: CalendarRange },
  { to: "/essays", label: "Essay workspace", icon: PenLine },
  { to: "/assistant", label: "Verified assistant", icon: Bot },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = path === item.to || path.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileChip({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, signOut } = useAppStore();
  const navigate = useNavigate();
  const initials = `${profile.firstName[0] ?? "S"}${profile.lastName[0] ?? ""}`;
  return (
    <div className="rounded-2xl bg-sidebar-accent p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-sun-gradient font-display font-bold text-accent-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-sidebar-accent-foreground">
            {profile.firstName ? `${profile.firstName} ${profile.lastName}` : "New student"}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            {profile.gradeLevel} grade · {profile.city || profile.county}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          to="/onboarding"
          onClick={onNavigate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-sidebar-border px-3 py-1.5 text-xs font-semibold text-sidebar-foreground hover:bg-sidebar"
        >
          <UserRound className="size-3.5" /> Edit profile
        </Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            onNavigate?.();
            navigate({ to: "/" });
          }}
          className="flex items-center justify-center gap-1.5 rounded-full border border-sidebar-border px-3 py-1.5 text-xs font-semibold text-sidebar-foreground hover:bg-sidebar"
          aria-label="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function StudentLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 bg-sidebar p-5 lg:flex">
        <Link to="/dashboard" className="px-1 pt-1">
          <Logo tone="inverse" />
        </Link>
        <NavLinks />
        <div className="mt-auto space-y-3">
          <p className="px-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
            Prototype · demo data only. Scholarship names and details are fictional.
          </p>
          <ProfileChip />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col gap-6 border-sidebar-border bg-sidebar p-5">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo tone="inverse" />
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="mt-auto">
                <ProfileChip onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
