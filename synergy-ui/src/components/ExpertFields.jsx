/**
 * Central definition of all expert fields and their sub-specializations.
 * Update this file to add/remove fields — Expert.jsx and User.jsx both consume it.
 */
export const EXPERT_FIELDS = [
  {
    value: "Computer Science",
    label: "Computer Science",
    subFields: [
      { value: "AI Scientist",        label: "AI Scientist" },
      { value: "Hardware Scientist",  label: "Hardware Scientist" },
      { value: "Software Engineer",   label: "Software Engineer" },
    ],
  },
  {
    value: "Physics",
    label: "Physics",
    subFields: [
      { value: "Quantum Physicist", label: "Quantum Physicist" },
      { value: "Astrophysicist",    label: "Astrophysicist" },
    ],
  },
  {
    value: "Mathematics",
    label: "Mathematics",
    subFields: [
      { value: "Algebraist",       label: "Algebraist" },
      { value: "Statistician",     label: "Statistician" },
      { value: "Applied Mathematician", label: "Applied Mathematician" },
    ],
  },
  {
    value: "Finance",
    label: "Finance",
    subFields: [
      { value: "Investment Analyst",  label: "Investment Analyst" },
      { value: "Financial Planner",   label: "Financial Planner" },
      { value: "Risk Manager",        label: "Risk Manager" },
    ],
  },
  {
    value: "Legal",
    label: "Legal",
    subFields: [
      { value: "Contract Lawyer",     label: "Contract Lawyer" },
      { value: "IP Lawyer",           label: "IP Lawyer" },
      { value: "Compliance Advisor",  label: "Compliance Advisor" },
    ],
  },
];

/**
 * Returns the subFields array for a given field value, or [] if not found.
 */
export function getSubFields(fieldValue) {
  return EXPERT_FIELDS.find((f) => f.value === fieldValue)?.subFields ?? [];
}