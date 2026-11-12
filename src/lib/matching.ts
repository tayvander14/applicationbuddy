import type { Scholarship, StudentProfile } from "@/lib/types";

export type CheckStatus = "met" | "unmet" | "verify";

export interface EligibilityCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface MatchResult {
  score: number; // 0–100
  checks: EligibilityCheck[];
  met: EligibilityCheck[];
  unmet: EligibilityCheck[];
  verify: EligibilityCheck[];
  /** No unmet rules and nothing left to verify. */
  fullyEligible: boolean;
  /** No unmet rules (may still have items to verify). */
  eligible: boolean;
  residencyCompatible: boolean;
  preferenceMatches: string[];
  tier: "strong" | "likely" | "not-eligible";
}

const STATE_NAMES = { DC: "D.C.", MD: "Maryland", VA: "Virginia" } as const;

/** Rule-based eligibility evaluation (F3). Pure and deterministic. */
export function evaluateMatch(profile: StudentProfile, s: Scholarship): MatchResult {
  const checks: EligibilityCheck[] = [];
  let residencyCompatible = true;

  if (s.residency?.states?.length) {
    const ok = s.residency.states.includes(profile.state);
    if (!ok) residencyCompatible = false;
    const names = s.residency.states.map((c) => STATE_NAMES[c]).join(", ");
    checks.push({
      id: "state",
      label: `Lives in ${names}`,
      status: ok ? "met" : "unmet",
      detail: ok
        ? `You live in ${STATE_NAMES[profile.state]}.`
        : `Your profile lists ${STATE_NAMES[profile.state]}.`,
    });
  }

  if (s.residency?.counties?.length) {
    const ok = s.residency.counties.includes(profile.county);
    if (!ok) residencyCompatible = false;
    checks.push({
      id: "county",
      label: `Resident of ${s.residency.counties.join(" or ")}`,
      status: ok ? "met" : "unmet",
      detail: ok ? `You live in ${profile.county}.` : `Your profile lists ${profile.county}.`,
    });
  }

  if (s.districts.length) {
    const ok = s.districts.includes(profile.district);
    checks.push({
      id: "district",
      label: `Attends ${s.districts.join(" or ")}`,
      status: ok ? "met" : "unmet",
      detail: ok
        ? `You attend ${profile.school || "a school"} in ${profile.district}.`
        : `Your profile lists ${profile.district}.`,
    });
  }

  if (s.minGpa !== null) {
    const ok = profile.gpa >= s.minGpa;
    checks.push({
      id: "gpa",
      label: `GPA of ${s.minGpa.toFixed(1)} or higher`,
      status: ok ? "met" : "unmet",
      detail: ok
        ? `Your GPA is ${profile.gpa.toFixed(2)}.`
        : `Your GPA is ${profile.gpa.toFixed(2)}, which is ${(s.minGpa - profile.gpa).toFixed(2)} below the minimum.`,
    });
  }

  if (s.majorFields) {
    const ok = s.majorFields.includes(profile.majorField);
    checks.push({
      id: "major",
      label: `Intended major in ${s.majorFields.join(" or ")}`,
      status: ok ? "met" : "unmet",
      detail: ok
        ? `You plan to study ${profile.intendedMajor || profile.majorField}.`
        : `Your intended major is ${profile.intendedMajor || profile.majorField}.`,
    });
  }

  {
    const ok = s.gradeLevels.includes(profile.gradeLevel);
    checks.push({
      id: "grade",
      label: `Open to ${s.gradeLevels.join(" and ")} graders`,
      status: ok ? "met" : "unmet",
      detail: ok
        ? `You're in ${profile.gradeLevel} grade.`
        : `You're in ${profile.gradeLevel} grade.`,
    });
  }

  if (s.minServiceHours) {
    const ok = profile.serviceHours >= s.minServiceHours;
    checks.push({
      id: "service",
      label: `At least ${s.minServiceHours} community service hours`,
      status: ok ? "met" : "unmet",
      detail: `You've logged ${profile.serviceHours} hours.`,
    });
  }

  if (s.firstGenRequired) {
    const status: CheckStatus =
      profile.firstGen === null ? "verify" : profile.firstGen ? "met" : "unmet";
    checks.push({
      id: "first-gen",
      label: "First-generation college student",
      status,
      detail:
        status === "verify"
          ? "Add this to your profile so we can check it."
          : status === "met"
            ? "Your profile says you'd be the first in your family to attend college."
            : "Your profile says you are not a first-generation student.",
    });
  }

  if (s.genderRequirement) {
    const status: CheckStatus = !profile.gender
      ? "verify"
      : profile.gender === s.genderRequirement
        ? "met"
        : "unmet";
    checks.push({
      id: "gender",
      label: `Identifies as a ${s.genderRequirement.toLowerCase()}`,
      status,
      detail:
        status === "verify" ? "You haven't shared this in your profile." : "Based on your profile.",
    });
  }

  if (s.financialNeed) {
    checks.push({
      id: "need",
      label: "Demonstrated financial need",
      status: "verify",
      detail:
        profile.fafsa === "submitted"
          ? "The donor confirms need from your FAFSA Submission Summary."
          : "Submit your FAFSA so the donor can confirm need.",
    });
  }

  if (s.citizenshipRequired) {
    const status: CheckStatus =
      profile.citizenship === "citizen" || profile.citizenship === "eligible-noncitizen"
        ? "met"
        : "verify";
    checks.push({
      id: "citizenship",
      label: "U.S. citizen or eligible noncitizen",
      status,
      detail:
        status === "met"
          ? "Based on your profile."
          : "Confirm with the donor's documentation rules.",
    });
  }

  const met = checks.filter((c) => c.status === "met");
  const unmet = checks.filter((c) => c.status === "unmet");
  const verify = checks.filter((c) => c.status === "verify");
  const preferenceMatches = s.preferredInterests.filter((i) => profile.interests.includes(i));

  const total = Math.max(checks.length, 1);
  const ruleScore = ((met.length + verify.length * 0.6) / total) * 88;
  const prefScore = s.preferredInterests.length
    ? (preferenceMatches.length / s.preferredInterests.length) * 12
    : 6;
  let score = Math.round(ruleScore + prefScore);
  if (unmet.length) score = Math.min(score, 55 - (unmet.length - 1) * 10);
  score = Math.max(5, Math.min(100, score));

  const eligible = unmet.length === 0;
  const fullyEligible = eligible && verify.length === 0;

  return {
    score,
    checks,
    met,
    unmet,
    verify,
    eligible,
    fullyEligible,
    residencyCompatible,
    preferenceMatches,
    tier: !eligible ? "not-eligible" : score >= 80 ? "strong" : "likely",
  };
}

export function rankScholarships(profile: StudentProfile, list: Scholarship[]) {
  return list
    .map((s) => ({ scholarship: s, match: evaluateMatch(profile, s) }))
    .sort(
      (a, b) =>
        b.match.score - a.match.score ||
        a.scholarship.deadlineInDays - b.scholarship.deadlineInDays,
    );
}
