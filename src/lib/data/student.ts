import type { DocKey, DocStatus, Stage, StudentProfile } from "@/lib/types";

/** The single demo student every screen is built around. */
export const DEMO_STUDENT: StudentProfile = {
  firstName: "Maya",
  lastName: "Thompson",
  gradeLevel: "12th",
  school: "Eastbrook High School",
  gpa: 3.72,
  intendedMajor: "Computer Science",
  majorField: "Computer Science",
  state: "MD",
  county: "Montgomery County",
  city: "Silver Spring",
  district: "Montgomery County Public Schools",
  interests: ["STEM", "Mentoring", "Community service"],
  activities: [
    "Robotics team captain (3 years)",
    "Peer math tutor at Long Branch Library",
    "Part-time cashier, neighborhood grocery",
    "Black Student Union treasurer",
  ],
  serviceHours: 85,
  firstGen: true,
  gender: "Woman",
  fafsa: "submitted",
  citizenship: "",
};

export const BLANK_STUDENT: StudentProfile = {
  firstName: "",
  lastName: "",
  gradeLevel: "12th",
  school: "",
  gpa: 3.0,
  intendedMajor: "",
  majorField: "Undecided",
  state: "MD",
  county: "Montgomery County",
  city: "Silver Spring",
  district: "Montgomery County Public Schools",
  interests: [],
  activities: [],
  serviceHours: 0,
  firstGen: null,
  gender: "",
  fafsa: "not-started",
  citizenship: "",
};

export const DEMO_APPLICATIONS: Record<string, Stage> = {
  "mc-stem-pathways": "in-progress",
  "silver-spring-rotary": "in-progress",
  "chesapeake-women-engineering": "saved",
  "horizon-first-gen": "saved",
  "future-coders": "submitted",
  "long-branch-library": "awarded",
};

export const DEMO_DOCS: Record<string, Partial<Record<DocKey, DocStatus>>> = {
  "mc-stem-pathways": {
    essay: "requested",
    transcript: "received",
    recommendation: "requested",
    fafsa: "submitted",
  },
  "silver-spring-rotary": {
    essay: "not-started",
    transcript: "requested",
    recommendation: "not-started",
    "service-log": "received",
  },
  "chesapeake-women-engineering": {
    essay: "not-started",
    transcript: "not-started",
    recommendation: "not-started",
    resume: "not-started",
  },
  "horizon-first-gen": {
    essay: "not-started",
    transcript: "not-started",
    recommendation: "not-started",
    "second-recommendation": "not-started",
    fafsa: "received",
  },
  "future-coders": { essay: "submitted", portfolio: "submitted", resume: "submitted" },
  "long-branch-library": {
    essay: "submitted",
    "service-log": "submitted",
    recommendation: "submitted",
  },
};
