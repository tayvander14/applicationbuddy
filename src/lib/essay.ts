import type { Scholarship } from "@/lib/types";

export interface ClicheHit {
  phrase: string;
  suggestion: string;
  count: number;
}

export interface EssayAnalysis {
  wordCount: number;
  lengthStatus: "empty" | "under" | "within" | "over";
  requirements: { label: string; met: boolean; matched: string | null }[];
  themes: { theme: string; status: "present" | "underrepresented" | "missing"; hits: number }[];
  cliches: ClicheHit[];
  detailPrompts: string[];
  hasNumbers: boolean;
  hasNamedPlaces: boolean;
}

export const CLICHES: { phrase: string; suggestion: string }[] = [
  { phrase: "hard worker", suggestion: "Show one moment that proves it — a late night, a schedule you juggled, a result you earned." },
  { phrase: "dream big", suggestion: "Name the actual goal and the first concrete step you've already taken toward it." },
  { phrase: "make a difference", suggestion: "Who, specifically, was better off? Describe what changed for them." },
  { phrase: "ever since i was young", suggestion: "Start with the specific memory instead — where were you, how old, what happened?" },
  { phrase: "ever since i was a child", suggestion: "Start with the specific memory instead — where were you, how old, what happened?" },
  { phrase: "passionate about", suggestion: "Replace the label with evidence: what do you do with your free time because of this interest?" },
  { phrase: "give back to the community", suggestion: "Name the community and the exact thing you plan to do or have done." },
  { phrase: "follow my dreams", suggestion: "Describe the dream in one specific sentence a reader could picture." },
  { phrase: "think outside the box", suggestion: "Describe the unusual idea itself and why it worked." },
  { phrase: "never give up", suggestion: "Tell the story of the moment you almost did — and what you did next." },
  { phrase: "in today's society", suggestion: "Point to one real situation in your school or neighborhood instead." },
  { phrase: "i have always wanted", suggestion: "Explain when and why the goal became real for you." },
  { phrase: "reach for the stars", suggestion: "Swap the slogan for a specific milestone you're working toward." },
  { phrase: "people person", suggestion: "Describe one conversation or relationship that shows this." },
  { phrase: "a better tomorrow", suggestion: "What would 'better' look like on your street a year from now?" },
];

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function occurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

/** Rule-based essay feedback (F5–F7). Gives feedback; never writes for the student. */
export function analyzeEssay(text: string, s: Pick<Scholarship, "wordLimit" | "promptRequirements" | "missionThemes">): EssayAnalysis {
  const lower = text.toLowerCase();
  const wordCount = countWords(text);
  const lengthStatus: EssayAnalysis["lengthStatus"] =
    wordCount === 0 ? "empty" : wordCount < s.wordLimit.min ? "under" : wordCount > s.wordLimit.max ? "over" : "within";

  const requirements = s.promptRequirements.map((r) => {
    const matched = r.keywords.find((k) => lower.includes(k.toLowerCase())) ?? null;
    return { label: r.label, met: matched !== null, matched };
  });

  const themes = s.missionThemes.map((t) => {
    const hits = t.keywords.reduce((sum, k) => sum + occurrences(lower, k.toLowerCase()), 0);
    const status: "present" | "underrepresented" | "missing" = hits === 0 ? "missing" : hits === 1 ? "underrepresented" : "present";
    return { theme: t.theme, status, hits };
  });

  const cliches = CLICHES.map((c) => ({ ...c, count: occurrences(lower, c.phrase) })).filter((c) => c.count > 0);

  const hasNumbers = /\d/.test(text);
  const hasNamedPlaces = text
    .split(/[.!?\n]+/)
    .some((sentence) => sentence.trim().split(/\s+/).slice(1).some((w) => /^[A-Z][a-z]{2,}/.test(w)));

  const detailPrompts: string[] = [];
  if (wordCount > 0) {
    if (!hasNumbers) detailPrompts.push("Add a number a reader can picture: hours, students, dollars, days, or a before/after result.");
    if (!hasNamedPlaces) detailPrompts.push("Name a real place or person — your school, a street, a library branch, a teacher.");
    if (!/\b(said|told|asked)\b/i.test(text)) detailPrompts.push("Is there one line of dialogue you remember? A quoted sentence makes a scene feel real.");
    if (/\bi am (a|an|very|really) \w+/i.test(text))
      detailPrompts.push("You describe yourself with a label (\"I am a…\"). Replace one label with a short story that shows it.");
    themes.filter((t) => t.status === "missing").forEach((t) => detailPrompts.push(`The donor cares about "${t.theme}". Which experience of yours connects to it?`));
  }

  return { wordCount, lengthStatus, requirements, themes, cliches, detailPrompts, hasNumbers, hasNamedPlaces };
}

export const SAMPLE_DRAFT = `Ever since I was young, I have been passionate about technology. I am a hard worker and I want to make a difference in my community.

Last spring our robotics team noticed that kids at the Long Branch Library had nowhere to practice coding after school. I talked to the branch manager, Ms. Alvarez, and we started a Saturday club. At first only three students came. I learned that you have to meet people where they are, so I translated our flyers into Spanish and moved the sessions to the hour after the free lunch program.

By June, 22 middle schoolers were building simple robots with us. One of them told me, "I didn't know girls could do this." That sentence is why I want to study computer science and keep teaching in Silver Spring.

In college I hope to dream big and give back to the community that raised me.`;
