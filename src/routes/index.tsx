import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CalendarCheck2, KanbanSquare, MapPin, MessagesSquare, PenLine, ScanSearch } from "lucide-react";

import heroImg from "@/assets/hero-student.jpg";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Application Buddy — Find and win scholarships in the DMV" },
      {
        name: "description",
        content: "Application Buddy helps DC, Maryland and Virginia high school students find scholarships they qualify for and track every deadline, document and essay.",
      },
      { property: "og:title", content: "Application Buddy — Find and win scholarships in the DMV" },
      { property: "og:description", content: "Local, national and university scholarships matched to your profile, with deadlines, documents and essay feedback in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: MapPin, title: "Discover hyper-local money", body: "County, city and school-district awards that national search sites miss — plus national and university scholarships." },
  { icon: ScanSearch, title: "Know exactly why you qualify", body: "Every match score explains which rules you meet, don't meet, or still need to verify." },
  { icon: KanbanSquare, title: "Track every application", body: "Drag applications from Saved to Awarded and see what each one still needs." },
  { icon: CalendarCheck2, title: "Never miss a deadline", body: "One timeline for every portal, with transcript, letter and FAFSA checklists." },
  { icon: PenLine, title: "Essay feedback, not ghostwriting", body: "Check word limits, prompt coverage, donor themes and generic phrases — your words stay yours." },
  { icon: MessagesSquare, title: "Answers you can trust", body: "A verified assistant explains aid terms in plain language and says so when it doesn't know." },
];

function Landing() {
  const { signInDemo } = useAppStore();
  const navigate = useNavigate();
  const enterDemo = () => {
    signInDemo();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" onClick={enterDemo}>
            Try the demo
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-12">
        <div className="animate-rise">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-card">
            <span className="size-1.5 rounded-full bg-accent" /> For DC, Maryland & Virginia students
          </p>
          <h1 className="text-5xl font-extrabold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
            Every scholarship you qualify for.{" "}
            <span className="relative whitespace-nowrap text-primary">
              One calm place
              <svg viewBox="0 0 300 16" className="absolute -bottom-2 left-0 h-3 w-full" aria-hidden="true">
                <path d="M3 11C70 3 200 2 297 9" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-accent" />
              </svg>
            </span>{" "}
            to apply.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Application Buddy matches you with local, national and university scholarships, explains your eligibility, and keeps every deadline,
            document and essay on track.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="hero" onClick={enterDemo}>
              Explore as a demo student <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/sign-in">Build my own profile</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No account needed — the demo uses Maya, a senior in Silver Spring, MD.</p>
        </div>

        <div className="relative animate-rise [animation-delay:120ms]">
          <img
            src={heroImg}
            alt="A student on her bedroom floor with a laptop, surrounded by a calendar, checklist and scholarship letter, with the D.C. skyline outside"
            width={1408}
            height={1152}
            className="w-full rounded-[2rem] border-4 border-card object-cover shadow-lift"
          />
          <div className="absolute -left-3 bottom-8 hidden max-w-[240px] rounded-2xl bg-card p-4 shadow-lift sm:block">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top match</p>
            <p className="mt-1 font-display font-bold leading-tight text-foreground">Montgomery County STEM Pathways</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
              <BadgeCheck className="size-3.5" /> Meets all 6 rules
            </p>
          </div>
          <div className="absolute -right-2 top-6 hidden rounded-2xl bg-ink px-4 py-3 text-ink-foreground shadow-lift sm:block">
            <p className="text-xs opacity-80">Next deadline</p>
            <p className="font-display text-lg font-bold">12 days · 2 docs left</p>
          </div>
        </div>
      </section>

      <section className="bg-ink-gradient text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Outside scholarships are scattered, competitive and confusing.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-foreground/15 p-6">
              <p className="font-display text-5xl font-extrabold text-accent">12.5%</p>
              <p className="mt-2 text-ink-foreground/85">of college students successfully receive a private scholarship.<sup>1</sup></p>
            </div>
            <div className="rounded-2xl border border-ink-foreground/15 p-6">
              <p className="font-display text-5xl font-extrabold text-accent">28%</p>
              <p className="mt-2 text-ink-foreground/85">of prospective students delay or skip college because of financial stress.<sup>2</sup></p>
            </div>
            <div className="rounded-2xl border border-ink-foreground/15 p-6">
              <p className="font-display text-5xl font-extrabold text-accent">1 place</p>
              <p className="mt-2 text-ink-foreground/85">for discovery, eligibility, deadlines, documents and essays — instead of a dozen portals.</p>
            </div>
          </div>
          <ol className="mt-8 space-y-1 text-xs text-ink-foreground/60">
            <li>1. UNCF, "Understanding the Shifting Landscape of Scholarships and Student Support" (citing Education Data Initiative).</li>
            <li>2. Appily, "Mental Health Challenges and Their Impact on College Readiness."</li>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything between "I should apply" and "I got it."</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start gap-5 rounded-3xl bg-sun-gradient p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-bold text-accent-foreground sm:text-3xl">See it with a real student journey.</h2>
            <p className="mt-1 text-accent-foreground/80">Step into Maya's account — every screen is connected.</p>
          </div>
          <Button size="lg" variant="hero" onClick={enterDemo}>
            Open the demo <ArrowRight />
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>Application Buddy · Senior Computer Science Capstone, Team Blurds</p>
          <p>Prototype with fictional demo data.</p>
        </div>
      </footer>
    </div>
  );
}
