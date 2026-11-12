import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, BadgeCheck, CheckCircle2, CircleHelp, ClipboardPaste, FileText, Info, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/app/logo";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getScholarship } from "@/lib/data/scholarships";
import { formatVerified } from "@/lib/dates";
import { answerQuestion, SAMPLE_OFFER, SAMPLE_QUESTIONS, type AssistantReply } from "@/lib/assistant";
import { DOC_STATUS_LABEL } from "@/lib/readiness";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/assistant")({
  validateSearch: (search: Record<string, unknown>): { s?: string | undefined } => ({
    s: typeof search["s"] === "string" ? search["s"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verified assistant — Application Buddy" },
      { name: "description", content: "Plain-language answers about scholarship requirements and financial aid terms, from verified sources only." },
      { property: "og:title", content: "Verified assistant — Application Buddy" },
      { property: "og:description", content: "Plain-language answers about scholarship requirements and financial aid terms, from verified sources only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assistant,
});

type Msg = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; reply: AssistantReply };

const CATEGORY_STYLE = {
  free: { label: "Free money", variant: "success" as const },
  loan: { label: "Loan", variant: "destructive" as const },
  work: { label: "Work-study", variant: "info" as const },
  cost: { label: "Cost", variant: "muted" as const },
  unknown: { label: "Unverified", variant: "warning" as const },
};

function ReplyCard({ reply }: { reply: AssistantReply }) {
  if (reply.kind === "answer")
    return (
      <div>
        <p className="mb-2 font-display text-lg font-bold text-foreground">{reply.title}</p>
        <div className="space-y-2 text-foreground">
          {reply.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success">
          <BadgeCheck className="size-3.5" /> Source: {reply.source.name} · {reply.source.url} · verified {formatVerified(reply.source.verifiedDaysAgo)}
        </p>
      </div>
    );

  if (reply.kind === "documents") {
    const pct = Math.round((reply.readyCount / reply.items.length) * 100);
    return (
      <div>
        <p className="text-foreground">
          The <strong>{reply.scholarship.name}</strong> requires {reply.items.length} materials. You have {reply.readyCount} ready.
        </p>
        <div className="my-3 flex items-center gap-2">
          <Progress value={pct} className="h-2 flex-1" aria-label={`${pct}% ready`} />
          <span className="text-xs font-bold text-foreground">{pct}% ready</span>
        </div>
        <ul className="space-y-1.5">
          {reply.items.map((i) => {
            const ready = i.status === "received" || i.status === "submitted";
            return (
              <li key={i.key} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  {ready ? <CheckCircle2 className="size-4 text-success" /> : <CircleHelp className="size-4 text-warning" />} {i.label}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{DOC_STATUS_LABEL[i.status]}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success">
          <BadgeCheck className="size-3.5" /> From the verified listing · {reply.scholarship.provider}
        </p>
        <div className="mt-3">
          <Button asChild size="sm" variant="outline">
            <Link to="/deadlines">Update my checklist</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (reply.kind === "eligibility")
    return (
      <div className="text-sm">
        <p className="text-base text-foreground">
          Your compatibility score for <strong>{reply.scholarship.name}</strong> is <strong>{reply.score}</strong>. Here's why:
        </p>
        {reply.met.length > 0 && (
          <ul className="mt-3 space-y-1">
            {reply.met.map((m) => (
              <li key={m} className="flex items-start gap-2 text-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {m}</li>
            ))}
          </ul>
        )}
        {reply.verify.length > 0 && (
          <ul className="mt-2 space-y-1">
            {reply.verify.map((m) => (
              <li key={m} className="flex items-start gap-2 text-foreground"><CircleHelp className="mt-0.5 size-4 shrink-0 text-warning" /> {m}</li>
            ))}
          </ul>
        )}
        {reply.unmet.length > 0 && (
          <ul className="mt-2 space-y-1">
            {reply.unmet.map((m) => (
              <li key={m} className="flex items-start gap-2 text-foreground"><XCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> {m}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success">
          <BadgeCheck className="size-3.5" /> Based on your saved profile and the verified listing
        </p>
      </div>
    );

  if (reply.kind === "offer")
    return (
      <div>
        <p className="text-foreground">Here's what each line in your offer letter means:</p>
        <ul className="mt-3 space-y-2">
          {reply.lines.map((l) => (
            <li key={l.text} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{l.text}</span>
                <Badge variant={CATEGORY_STYLE[l.category].variant}>{CATEGORY_STYLE[l.category].label}</Badge>
              </div>
              <p className="mt-0.5 text-muted-foreground">{l.explanation}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-info-soft px-2.5 py-2 text-xs font-medium text-info">
          <Info className="mt-0.5 size-3.5 shrink-0" /> Net price and funding-gap calculations are coming in a later version of this prototype.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success">
          <BadgeCheck className="size-3.5" /> Definitions from Federal Student Aid (studentaid.gov)
        </p>
      </div>
    );

  return (
    <div className="rounded-xl border border-warning/30 bg-warning-soft p-3">
      <p className="flex items-center gap-2 font-bold text-warning">
        <ShieldAlert className="size-4" /> No verified answer
      </p>
      <p className="mt-1 text-sm text-foreground">{reply.reason}</p>
    </div>
  );
}

function Assistant() {
  const { s: contextId } = Route.useSearch();
  const { profile, docs } = useAppStore();
  const contextScholarship = contextId ? getScholarship(contextId) : undefined;
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = answerQuestion(text, { profile, docs, contextScholarshipId: contextId });
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", reply }]);
      setThinking(false);
    }, 650);
  };

  const suggestions = contextScholarship
    ? [`What documents do I need for the ${contextScholarship.name}?`, `Why do I qualify for the ${contextScholarship.name}?`, ...SAMPLE_QUESTIONS.slice(0, 3)]
    : SAMPLE_QUESTIONS;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Verified assistant"
        title="Ask about aid, in plain language"
        description={
          <span className="inline-flex items-start gap-1.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Answers come only from verified sources and your scholarship listings. If it isn't verified, Buddy will say so.
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="flex min-h-[560px] flex-col rounded-3xl border bg-card shadow-card" aria-label="Conversation">
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6" aria-live="polite">
            {messages.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <LogoMark className="size-14" />
                <h2 className="mt-3 text-2xl font-bold text-foreground">Hi {profile.firstName || "there"}, I'm Buddy.</h2>
                <p className="mt-1 max-w-md text-muted-foreground">
                  I explain financial aid terms and scholarship requirements. I don't guess — try one of these:
                </p>
                <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="rounded-full border border-input bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-ink-foreground">{m.text}</p>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <LogoMark className="size-8 shrink-0" />
                  <div className="min-w-0 max-w-[90%] flex-1">
                    <ReplyCard reply={m.reply} />
                  </div>
                </div>
              ),
            )}
            {thinking && (
              <div className="flex items-center gap-3" aria-label="Buddy is checking verified sources">
                <LogoMark className="size-8" />
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot size-2 rounded-full bg-primary" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
                <span className="text-xs text-muted-foreground">Checking verified sources…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-t px-4 py-2.5">
              {suggestions.slice(0, 5).map((q) => (
                <button key={q} onClick={() => ask(q)} className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-primary-soft">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            className="border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
                rows={1}
                placeholder="Ask about a term, a scholarship, or paste offer letter lines…"
                aria-label="Message Buddy"
                className="max-h-40 min-h-10 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || thinking} aria-label="Send">
                <ArrowUp />
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-sans text-sm font-bold text-foreground">
              <ClipboardPaste className="size-4 text-primary" /> Decode an offer letter
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Paste the lines from a college's offer and Buddy labels free money, loans and work-study.</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setInput(SAMPLE_OFFER)}>
              <FileText /> Use a sample offer letter
            </Button>
          </div>
          <div className="rounded-2xl bg-ink-gradient p-5 text-ink-foreground">
            <h2 className="font-sans text-sm font-bold">How Buddy stays accurate</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink-foreground/85">
              <li>• Answers only from Federal Student Aid, the College Board and reviewed guides.</li>
              <li>• Scholarship facts come from verified listings.</li>
              <li>• Every answer shows its source and verified date.</li>
              <li>• When it doesn't know, it says so.</li>
            </ul>
          </div>
          {contextScholarship && (
            <p className={cn("rounded-xl bg-primary-soft px-4 py-3 text-sm text-foreground")}>
              Asking about <strong>{contextScholarship.name}</strong>.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
