import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, MapPin, UserPlus } from "lucide-react";

import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { DEMO_STUDENT } from "@/lib/data/student";
import { useAppStore } from "@/lib/store/app-store";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Application Buddy" },
      { name: "description", content: "Enter the Application Buddy demo as a student or start a new scholarship profile." },
      { property: "og:title", content: "Sign in — Application Buddy" },
      { property: "og:description", content: "Enter the Application Buddy demo as a student or start a new scholarship profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { signInDemo, startFresh } = useAppStore();
  const navigate = useNavigate();
  const s = DEMO_STUDENT;

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link to="/" aria-label="Application Buddy home">
          <Logo />
        </Link>
        <div className="mt-12 text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Choose how you'd like to explore this prototype.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border bg-card p-6 shadow-lift sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Demo student account</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-sun-gradient font-display text-2xl font-bold text-accent-foreground">
                MT
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {s.firstName} {s.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{s.school}</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-foreground sm:grid-cols-2">
              <li className="flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Senior · {s.gpa} GPA</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> {s.city}, {s.state}</li>
              <li className="col-span-full text-muted-foreground">Intended major: {s.intendedMajor} · First-generation student · 6 applications in progress</li>
            </ul>
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => {
                signInDemo();
                navigate({ to: "/dashboard" });
              }}
            >
              Continue as Maya <ArrowRight />
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Your saved filters and recommendations load automatically.</p>
          </section>

          <section className="flex flex-col rounded-3xl border border-dashed border-input bg-card/70 p-6 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <UserPlus className="size-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">New here?</h2>
            <p className="mt-1 text-muted-foreground">Build your own student profile in about two minutes and see your matches.</p>
            <Button
              variant="outline"
              size="lg"
              className="mt-auto w-full"
              onClick={() => {
                startFresh();
                navigate({ to: "/onboarding" });
              }}
            >
              Create a profile
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
