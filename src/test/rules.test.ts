import { describe, expect, it } from "vitest";

import { answerQuestion } from "@/lib/assistant";
import { getScholarship } from "@/lib/data/scholarships";
import { DEMO_DOCS, DEMO_STUDENT } from "@/lib/data/student";
import { analyzeEssay } from "@/lib/essay";
import { evaluateMatch } from "@/lib/matching";
import { isAtRisk, readiness } from "@/lib/readiness";

const stem = getScholarship("mc-stem-pathways")!;

describe("eligibility matching", () => {
  it("treats a GPA exactly at the minimum as met", () => {
    const m = evaluateMatch({ ...DEMO_STUDENT, gpa: 3.3 }, stem);
    expect(m.checks.find((c) => c.id === "gpa")?.status).toBe("met");
  });

  it("marks a GPA below the minimum as unmet and not eligible", () => {
    const m = evaluateMatch({ ...DEMO_STUDENT, gpa: 3.29 }, stem);
    expect(m.checks.find((c) => c.id === "gpa")?.status).toBe("unmet");
    expect(m.eligible).toBe(false);
  });

  it("flags out-of-region residency as incompatible", () => {
    const m = evaluateMatch(DEMO_STUDENT, getScholarship("fairfax-tech")!);
    expect(m.residencyCompatible).toBe(false);
    expect(m.eligible).toBe(false);
  });

  it("puts financial need in the 'verify' group instead of guessing", () => {
    const m = evaluateMatch(DEMO_STUDENT, getScholarship("horizon-first-gen")!);
    expect(m.verify.map((c) => c.id)).toContain("need");
    expect(m.eligible).toBe(true);
    expect(m.fullyEligible).toBe(false);
  });
});

describe("essay checks", () => {
  const limits = { wordLimit: { min: 3, max: 5 }, promptRequirements: [], missionThemes: [] };

  it("alerts when the draft is over the word limit", () => {
    expect(analyzeEssay("one two three four five six", limits).lengthStatus).toBe("over");
  });

  it("detects the cliché 'hard worker'", () => {
    expect(analyzeEssay("I am a hard worker", limits).cliches.map((c) => c.phrase)).toContain("hard worker");
  });
});

describe("document readiness", () => {
  it("counts received and submitted items as ready", () => {
    expect(readiness(stem, DEMO_DOCS["mc-stem-pathways"])).toBe(50);
  });

  it("warns when materials are incomplete within 14 days of the deadline", () => {
    expect(isAtRisk(stem, DEMO_DOCS["mc-stem-pathways"])).toBe(true);
  });
});

describe("verified assistant", () => {
  const ctx = { profile: DEMO_STUDENT, docs: DEMO_DOCS };

  it("abstains when no verified information exists", () => {
    expect(answerQuestion("Which college should I choose?", ctx).kind).toBe("abstain");
  });

  it("answers SAI from a verified source", () => {
    const r = answerQuestion("What is the SAI?", ctx);
    expect(r.kind).toBe("answer");
  });
});
