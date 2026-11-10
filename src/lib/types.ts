export type StateCode = "DC" | "MD" | "VA";
export type Scope = "local" | "national" | "university";
export type Disbursement = "student" | "university";
export type Stacking = "allowed" | "limited" | "not-allowed";
export type GradeLevel = "9th" | "10th" | "11th" | "12th";
export type FafsaStatus = "not-started" | "in-progress" | "submitted";
export type Stage = "saved" | "in-progress" | "submitted" | "awarded";
export type DocStatus = "not-started" | "requested" | "received" | "submitted";

export type DocKey =
  | "essay"
  | "transcript"
  | "recommendation"
  | "second-recommendation"
  | "fafsa"
  | "resume"
  | "portfolio"
  | "residency-proof"
  | "service-log";

export interface StudentProfile {
  firstName: string;
  lastName: string;
  gradeLevel: GradeLevel;
  school: string;
  gpa: number;
  intendedMajor: string;
  majorField: string; // matching category, e.g. "Computer Science"
  state: StateCode;
  county: string;
  city: string;
  district: string;
  interests: string[];
  activities: string[];
  serviceHours: number;
  firstGen: boolean | null;
  gender: string; // optional, "" when not shared
  fafsa: FafsaStatus;
  citizenship: "citizen" | "eligible-noncitizen" | "prefer-not" | "";
}

export interface PromptRequirement {
  label: string;
  keywords: string[];
}

export interface MissionTheme {
  theme: string;
  keywords: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  source: string; // where the listing was verified
  scope: Scope;
  state: StateCode | null;
  counties: string[];
  districts: string[];
  amount: number;
  renewable: boolean;
  deadlineInDays: number; // relative to today, keeps the demo fresh
  disbursement: Disbursement;
  stacking: Stacking;
  stackingNote: string;
  residency: { states?: StateCode[]; counties?: string[] } | null;
  minGpa: number | null;
  majorFields: string[] | null; // null = any major
  gradeLevels: GradeLevel[];
  firstGenRequired?: boolean;
  financialNeed?: boolean;
  minServiceHours?: number;
  genderRequirement?: string;
  citizenshipRequired?: boolean;
  preferredInterests: string[];
  requiredMaterials: DocKey[];
  essayPrompt: string;
  wordLimit: { min: number; max: number };
  promptRequirements: PromptRequirement[];
  mission: string;
  missionThemes: MissionTheme[];
  verified: boolean;
  lastVerifiedDaysAgo: number;
  applicantPool: "small" | "medium" | "large";
  portal: string;
  summary: string;
}
