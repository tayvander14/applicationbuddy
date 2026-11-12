import type { StateCode } from "@/lib/types";

export interface County {
  name: string;
  state: StateCode;
  cities: string[];
  district: string;
}

export const STATES: { code: StateCode; name: string }[] = [
  { code: "DC", name: "Washington, D.C." },
  { code: "MD", name: "Maryland" },
  { code: "VA", name: "Virginia" },
];

export const COUNTIES: County[] = [
  {
    name: "District of Columbia",
    state: "DC",
    cities: ["Washington"],
    district: "DC Public Schools",
  },
  {
    name: "Montgomery County",
    state: "MD",
    cities: ["Silver Spring", "Rockville", "Bethesda", "Gaithersburg"],
    district: "Montgomery County Public Schools",
  },
  {
    name: "Prince George's County",
    state: "MD",
    cities: ["Hyattsville", "Bowie", "College Park", "Upper Marlboro"],
    district: "Prince George's County Public Schools",
  },
  {
    name: "Howard County",
    state: "MD",
    cities: ["Columbia", "Ellicott City"],
    district: "Howard County Public Schools",
  },
  {
    name: "Baltimore City",
    state: "MD",
    cities: ["Baltimore"],
    district: "Baltimore City Public Schools",
  },
  {
    name: "Fairfax County",
    state: "VA",
    cities: ["Fairfax", "Reston", "Annandale", "McLean"],
    district: "Fairfax County Public Schools",
  },
  {
    name: "Arlington County",
    state: "VA",
    cities: ["Arlington"],
    district: "Arlington Public Schools",
  },
  {
    name: "Alexandria City",
    state: "VA",
    cities: ["Alexandria"],
    district: "Alexandria City Public Schools",
  },
  {
    name: "Loudoun County",
    state: "VA",
    cities: ["Leesburg", "Ashburn", "Sterling"],
    district: "Loudoun County Public Schools",
  },
  {
    name: "Prince William County",
    state: "VA",
    cities: ["Manassas", "Woodbridge"],
    district: "Prince William County Schools",
  },
];

export const MAJOR_FIELDS = [
  "Computer Science",
  "Engineering",
  "Health & Nursing",
  "Business",
  "Education",
  "Arts & Design",
  "Social Sciences",
  "Natural Sciences",
  "Undecided",
];

export const INTERESTS = [
  "STEM",
  "Community service",
  "Mentoring",
  "Leadership",
  "Arts",
  "Athletics",
  "Environment",
  "Entrepreneurship",
  "Health",
  "Civic engagement",
];
