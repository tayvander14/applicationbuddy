import { DOC_LABELS, SCHOLARSHIPS } from "@/lib/data/scholarships";
import { evaluateMatch } from "@/lib/matching";
import type { DocKey, DocStatus, Scholarship, StudentProfile } from "@/lib/types";

export interface VerifiedSource {
  name: string;
  url: string;
  verifiedDaysAgo: number;
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  keywords: string[];
  answer: string[];
  source: VerifiedSource;
}

const FSA = (days: number): VerifiedSource => ({
  name: "Federal Student Aid (U.S. Dept. of Education)",
  url: "studentaid.gov",
  verifiedDaysAgo: days,
});

/** Verified knowledge base. The assistant may only answer from these entries or the scholarship catalog. */
export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "sai",
    topic: "Student Aid Index (SAI)",
    keywords: ["sai", "student aid index", "efc", "expected family contribution"],
    answer: [
      "The Student Aid Index (SAI) is a number calculated from your FAFSA. Colleges use it to figure out how much need-based aid you can receive.",
      "It is not the amount your family has to pay. A lower SAI (it can even be negative, down to −1,500) usually means more need-based aid.",
      'The SAI replaced the old "Expected Family Contribution" (EFC).',
    ],
    source: FSA(12),
  },
  {
    id: "fafsa",
    topic: "FAFSA",
    keywords: ["fafsa", "free application"],
    answer: [
      "The FAFSA (Free Application for Federal Student Aid) is the form you fill out to apply for federal grants, work-study and federal student loans. Many states, colleges and scholarships use it too.",
      "It's free — you should never pay to submit it. You fill it out once for each school year you need aid.",
      "Check studentaid.gov for this year's opening date and your state's and colleges' priority deadlines.",
    ],
    source: FSA(12),
  },
  {
    id: "fss",
    topic: "FAFSA Submission Summary",
    keywords: ["submission summary", "student aid report", "sar", "fss"],
    answer: [
      "After you submit the FAFSA, you receive a FAFSA Submission Summary. It shows the answers you gave and your estimated Student Aid Index (SAI).",
      "It replaced the older Student Aid Report (SAR). Some scholarships ask for it as proof of financial need — download it from your studentaid.gov account.",
    ],
    source: FSA(12),
  },
  {
    id: "net-price",
    topic: "Net price vs. published tuition",
    keywords: [
      "net price",
      "sticker price",
      "published tuition",
      "published price",
      "cost of attendance",
      "coa",
      "what will i pay",
    ],
    answer: [
      'Published tuition (the "sticker price") is what a college lists before any aid.',
      "Cost of attendance is bigger: tuition and fees plus housing, food, books, transportation and personal costs.",
      "Net price is cost of attendance minus grants and scholarships — the money you don't pay back. Loans don't lower your net price; they're a way to pay it.",
    ],
    source: FSA(12),
  },
  {
    id: "stacking",
    topic: "Aid stacking and displacement",
    keywords: [
      "stack",
      "stacking",
      "displacement",
      "displace",
      "combine",
      "reduce my aid",
      "outside scholarship",
    ],
    answer: [
      '"Stacking" means combining an outside scholarship with the aid your college already offered.',
      "Some colleges reduce their own grants when you bring in outside money — this is called displacement. Others reduce loans or work-study first, which is better for you.",
      "Every scholarship in Application Buddy shows its stacking policy. Before you accept, ask your college's financial aid office how they apply outside awards.",
    ],
    source: {
      name: "Application Buddy verified policy guide (reviewed with DMV counselors)",
      url: "applicationbuddy.app/guides/stacking",
      verifiedDaysAgo: 20,
    },
  },
  {
    id: "loans",
    topic: "Subsidized vs. unsubsidized loans",
    keywords: ["subsidized", "unsubsidized", "loan", "loans", "direct loan", "interest"],
    answer: [
      "Both are federal Direct Loans that you must repay.",
      "Subsidized loans are for students with financial need. The government pays the interest while you're in school at least half-time.",
      "Unsubsidized loans aren't based on need. Interest starts adding up right away, even while you're in school.",
    ],
    source: FSA(12),
  },
  {
    id: "pell",
    topic: "Federal Pell Grant",
    keywords: ["pell"],
    answer: [
      "The Federal Pell Grant is need-based aid for undergraduates. In most cases you don't repay it.",
      "Eligibility comes from your FAFSA, so submitting the FAFSA is the only way to be considered.",
    ],
    source: FSA(12),
  },
  {
    id: "aid-types",
    topic: "Grants, scholarships, loans and work-study",
    keywords: [
      "grant",
      "grants",
      "types of aid",
      "work-study",
      "work study",
      "difference between",
      "free money",
    ],
    answer: [
      "Grants — usually need-based, from the government or your college. You generally don't repay them.",
      "Scholarships — usually based on merit, background or interests, from colleges or outside donors. You don't repay them.",
      "Loans — borrowed money you repay with interest.",
      "Work-study — a part-time job, often on campus, that pays you as you work. It isn't subtracted from your bill up front.",
    ],
    source: FSA(12),
  },
  {
    id: "disbursement",
    topic: "Disbursement",
    keywords: ["disbursement", "disbursed", "paid to", "sent to the school", "sent to my college"],
    answer: [
      "Disbursement is how scholarship money is paid out.",
      "Paid to the university: the money goes to your student account and covers your bill first.",
      "Paid to the student: you receive the money directly and can use it for education costs like books, a laptop or transportation. Some of it may count as taxable income if it isn't used for tuition, fees, books or required supplies.",
    ],
    source: {
      name: "Application Buddy verified policy guide (reviewed with DMV counselors)",
      url: "applicationbuddy.app/guides/disbursement",
      verifiedDaysAgo: 20,
    },
  },
  {
    id: "css",
    topic: "CSS Profile",
    keywords: ["css", "css profile", "college board profile"],
    answer: [
      "The CSS Profile is a separate financial aid application run by the College Board. Some private colleges use it to award their own grants.",
      "Unlike the FAFSA, it may have a fee, though fee waivers are available. Check each college's website to see whether it's required.",
    ],
    source: {
      name: "College Board CSS Profile help center",
      url: "cssprofile.collegeboard.org",
      verifiedDaysAgo: 30,
    },
  },
  {
    id: "merit-need",
    topic: "Merit-based vs. need-based aid",
    keywords: ["merit", "need-based", "need based", "financial need"],
    answer: [
      "Merit-based aid rewards things like grades, talent or leadership. Need-based aid depends on your family's finances, usually measured by your FAFSA (and sometimes the CSS Profile).",
      'Some scholarships combine both — Application Buddy marks a "Demonstrated financial need" rule as something to verify with your FAFSA Submission Summary.',
    ],
    source: FSA(12),
  },
  {
    id: "renewable",
    topic: "Renewable scholarships",
    keywords: ["renewable", "renew", "every year", "multi-year"],
    answer: [
      "A renewable scholarship can be paid again in later years if you keep meeting its conditions, such as a minimum college GPA or full-time enrollment.",
      "Read the renewal rules before you accept so you know what you need to keep it.",
    ],
    source: {
      name: "Application Buddy verified policy guide (reviewed with DMV counselors)",
      url: "applicationbuddy.app/guides/renewal",
      verifiedDaysAgo: 20,
    },
  },
];

export type AssistantReply =
  | { kind: "answer"; title: string; paragraphs: string[]; source: VerifiedSource }
  | {
      kind: "documents";
      scholarship: Scholarship;
      items: { key: DocKey; label: string; status: DocStatus }[];
      readyCount: number;
    }
  | {
      kind: "eligibility";
      scholarship: Scholarship;
      score: number;
      met: string[];
      unmet: string[];
      verify: string[];
    }
  | {
      kind: "offer";
      lines: {
        text: string;
        category: "free" | "loan" | "work" | "cost" | "unknown";
        explanation: string;
      }[];
    }
  | { kind: "abstain"; reason: string };

function findScholarship(q: string, contextId?: string): Scholarship | undefined {
  const lower = q.toLowerCase();
  const byName = SCHOLARSHIPS.find((s) => {
    const words = s.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter((w) => w.length > 4);
    const hits = words.filter((w) => lower.includes(w)).length;
    return hits >= 2 || lower.includes(s.name.toLowerCase());
  });
  return byName ?? (contextId ? SCHOLARSHIPS.find((s) => s.id === contextId) : undefined);
}

function classifyOfferLine(line: string) {
  const l = line.toLowerCase();
  if (/unsubsidized/.test(l))
    return {
      category: "loan" as const,
      explanation: "Unsubsidized loan — you repay it, and interest starts right away.",
    };
  if (/subsidized/.test(l))
    return {
      category: "loan" as const,
      explanation:
        "Subsidized loan — you repay it; interest is covered while you're enrolled at least half-time.",
    };
  if (/plus/.test(l))
    return {
      category: "loan" as const,
      explanation:
        "Parent PLUS loan — borrowed by your parent, who is responsible for repaying it.",
    };
  if (/loan/.test(l))
    return {
      category: "loan" as const,
      explanation: "Loan — borrowed money you repay with interest.",
    };
  if (/work[- ]?study/.test(l))
    return {
      category: "work" as const,
      explanation:
        "Work-study — money you earn from a part-time job; it isn't subtracted from your bill up front.",
    };
  if (/pell|grant/.test(l))
    return {
      category: "free" as const,
      explanation: "Grant — generally doesn't need to be repaid.",
    };
  if (/scholarship|award/.test(l))
    return {
      category: "free" as const,
      explanation: "Scholarship — doesn't need to be repaid. Check renewal rules.",
    };
  if (/tuition|fees|housing|room|board|meal|books|cost of attendance/.test(l))
    return {
      category: "cost" as const,
      explanation: "A cost line — part of your cost of attendance, not aid.",
    };
  return {
    category: "unknown" as const,
    explanation:
      "I don't have verified information to classify this line. Ask your college's financial aid office.",
  };
}

export function answerQuestion(
  question: string,
  ctx: {
    profile: StudentProfile;
    docs: Record<string, Partial<Record<DocKey, DocStatus>>>;
    contextScholarshipId?: string | undefined;
  },
): AssistantReply {
  const q = question.trim();
  const lower = q.toLowerCase();
  if (!q)
    return {
      kind: "abstain",
      reason: "Ask me a question about a scholarship or a financial aid term.",
    };

  // Pasted offer letter (several lines with dollar amounts)
  const moneyLines = q.split(/\n+/).filter((l) => /\$\s?\d/.test(l));
  if (
    moneyLines.length >= 2 ||
    (/offer letter|award letter/.test(lower) && moneyLines.length >= 1)
  ) {
    return {
      kind: "offer",
      lines: moneyLines.map((text) => ({ text: text.trim(), ...classifyOfferLine(text) })),
    };
  }

  const scholarship = findScholarship(q, ctx.contextScholarshipId);

  if (
    scholarship &&
    /(document|material|need to submit|what do i need|ready|readiness|missing|checklist|require)/.test(
      lower,
    )
  ) {
    const saved = ctx.docs[scholarship.id] ?? {};
    const items = scholarship.requiredMaterials.map((key) => ({
      key,
      label: DOC_LABELS[key],
      status: saved[key] ?? ("not-started" as DocStatus),
    }));
    return {
      kind: "documents",
      scholarship,
      items,
      readyCount: items.filter((i) => i.status === "received" || i.status === "submitted").length,
    };
  }

  if (scholarship && /(eligible|qualify|match|why|can i apply)/.test(lower)) {
    const m = evaluateMatch(ctx.profile, scholarship);
    return {
      kind: "eligibility",
      scholarship,
      score: m.score,
      met: m.met.map((c) => c.label),
      unmet: m.unmet.map((c) => `${c.label} — ${c.detail}`),
      verify: m.verify.map((c) => `${c.label} — ${c.detail}`),
    };
  }

  let best: { entry: KnowledgeEntry; hits: number } | null = null;
  for (const entry of KNOWLEDGE) {
    const hits = entry.keywords.filter((k) =>
      new RegExp(`(^|[^a-z])${k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^a-z]|$)`).test(lower),
    ).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { entry, hits };
  }
  if (best)
    return {
      kind: "answer",
      title: best.entry.topic,
      paragraphs: best.entry.answer,
      source: best.entry.source,
    };

  return {
    kind: "abstain",
    reason:
      "I don't have verified information to answer that, so I won't guess. Try asking about a financial aid term (like SAI, net price or work-study) or a scholarship in your list — or check with your school counselor or a college's financial aid office.",
  };
}

export const SAMPLE_QUESTIONS = [
  "What is the SAI?",
  "Net price vs. published tuition?",
  "What does aid stacking mean?",
  "What documents do I need for the Horizon First-Generation Scholars Program?",
  "Why do I qualify for the Montgomery County STEM Pathways Scholarship?",
  "Subsidized vs. unsubsidized loans?",
  "Which college should I choose?",
];

export const SAMPLE_OFFER = `Potomac University offer letter
Tuition and fees: $38,400
Potomac Engineering Merit Award: $6,000
Federal Pell Grant: $4,100
Federal Direct Subsidized Loan: $3,500
Federal Direct Unsubsidized Loan: $2,000
Federal Work-Study: $2,500`;
