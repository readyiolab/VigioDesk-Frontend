import { LETTER_SYSTEM_FIELDS } from "@/lib/letterMapping";

/** Canonical letter merge fields — keep in sync with backend SYSTEM_FIELDS. */
export const SYSTEM_FIELDS = LETTER_SYSTEM_FIELDS;

export type SystemField = (typeof SYSTEM_FIELDS)[number];

export const FIELD_META: Record<
  string,
  { label: string; description?: string }
> = {
  Employee_ID: { label: "Employee ID", description: "Unique employee code" },
  Employee_Name: { label: "Employee name", description: "Full name on the letter" },
  Employee_Email: { label: "Employee email", description: "For email delivery" },
  Designation: { label: "Job title", description: "Role / designation" },
  Department: { label: "Department" },
  Old_CTC: { label: "Current CTC", description: "Salary before change" },
  New_CTC: { label: "New CTC", description: "Revised salary" },
  Increment_Percent: { label: "Raise %", description: "Increment percentage" },
  Effective_Date: { label: "Effective date", description: "When the change applies" },
  PDF_Password: { label: "PDF password", description: "Opens the protected PDF" },
  Manager_Name: { label: "Manager name", description: "Who signs / manager" },
};

export function fieldLabel(field: string): string {
  return FIELD_META[field]?.label || field.replace(/_/g, " ");
}

export const LETTER_TYPE_LABELS: Record<string, string> = {
  INCREMENT: "Salary Increment Letter",
  PROMOTION: "Promotion Letter",
  SALARY_REVISION: "Salary Revision Letter",
  OFFER: "Offer Letter",
  CONFIRMATION: "Confirmation Letter",
  WARNING: "Warning Letter",
  SEPARATION: "Separation Letter",
};

export function letterTypeLabel(type: string): string {
  return LETTER_TYPE_LABELS[type] || type.replace(/_/g, " ");
}
