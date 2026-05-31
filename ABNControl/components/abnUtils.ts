/**
 * ABN (Australian Business Number) helpers.
 *
 * The ABN is an 11-digit identifier issued by the Australian Business Register.
 * It is conventionally displayed grouped as 2-3-3-3 (e.g. "51 824 753 556").
 *
 * This module only enforces the *length* rule (11 digits) and the standard
 * display format. The full ATO modulus-89 checksum is intentionally left out
 * (it can be added later in `validateAbn` without changing the public API).
 */

export const ABN_DIGIT_LENGTH = 11;

/** Strip everything that isn't a digit. Returns at most 11 digits. */
export function stripToDigits(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D+/g, "").slice(0, ABN_DIGIT_LENGTH);
}

/**
 * Format a raw digit string as `XX XXX XXX XXX`.
 * - Tolerates partial input (e.g. "51824" -> "51 824").
 * - Returns "" for null/undefined/empty.
 */
export function formatAbn(value: string | null | undefined): string {
  const digits = stripToDigits(value);
  if (digits.length === 0) return "";

  // Group as 2-3-3-3
  const groups: string[] = [];
  groups.push(digits.slice(0, 2));
  if (digits.length > 2) groups.push(digits.slice(2, 5));
  if (digits.length > 5) groups.push(digits.slice(5, 8));
  if (digits.length > 8) groups.push(digits.slice(8, 11));

  return groups.filter(Boolean).join(" ");
}

export interface AbnValidationResult {
  isValid: boolean;
  /** Localizable error key, or undefined when valid. */
  errorKey?: "Error_Length" | "Error_NonDigits";
  /** Pre-resolved English message for convenience. */
  errorMessage?: string;
}

/**
 * Validate an ABN value.
 * Empty input is treated as valid here — the platform's `required` flag is
 * what blocks save when the field is mandatory.
 */
export function validateAbn(value: string | null | undefined): AbnValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: true };
  }

  // Anything other than digits/whitespace is rejected up front.
  if (/[^\d\s]/.test(value)) {
    return {
      isValid: false,
      errorKey: "Error_NonDigits",
      errorMessage: "ABN can only contain digits and spaces.",
    };
  }

  const digits = stripToDigits(value);
  if (digits.length !== ABN_DIGIT_LENGTH) {
    return {
      isValid: false,
      errorKey: "Error_Length",
      errorMessage: "ABN must be exactly 11 digits.",
    };
  }

  return { isValid: true };
}
