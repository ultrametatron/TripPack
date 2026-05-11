export function normalizeTripText(value: string): string {
  return value.trim();
}

export function isValidDateRange(start?: string, end?: string): boolean {
  if (!start || !end) return true;
  return end >= start;
}

export function getDateRangeError(start?: string, end?: string): string | null {
  if (isValidDateRange(start, end)) return null;
  return "End date must be the same as or after the start date.";
}
