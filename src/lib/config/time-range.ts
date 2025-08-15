/**
 * Global time range configuration
 * Defines the allowed date ranges for the entire application
 */

export interface TimeRangeConfig {
  /** Earliest allowed year */
  minYear: number;
  /** Latest allowed year */
  maxYear: number;
  /** Earliest allowed month (1-12) */
  minMonth: number;
  /** Latest allowed month (1-12) */
  maxMonth: number;
  /** Default year for new sessions */
  defaultYear: number;
  /** Default month for new sessions */
  defaultMonth: number;
}

/**
 * Global time range configuration
 * This configuration is used across all components that handle time-based data
 */
export const TIME_RANGE_CONFIG: TimeRangeConfig = {
  minYear: 2012,
  maxYear: 2025,
  minMonth: 1,
  maxMonth: 12,
  defaultYear: new Date().getFullYear(),
  defaultMonth: new Date().getMonth() + 1,
};

/**
 * Legacy constants for backward compatibility
 * @deprecated Use getAvailableYears() instead
 */
export const YEARS = (() => {
  const years: string[] = [];
  for (let year = TIME_RANGE_CONFIG.maxYear; year >= TIME_RANGE_CONFIG.minYear; year--) {
    years.push(year.toString());
  }
  return years;
})();

/**
 * Legacy constants for backward compatibility
 * @deprecated Use getMonthNames() instead
 */
export const MONTH_NAMES = [
  "1 月", "2 月", "3 月", "4 月", "5 月", "6 月",
  "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"
];

/**
 * Legacy constants for backward compatibility
 * @deprecated Use getAvailableMonths() instead
 */
export const MONTHS = [
  { value: "1", label: "1 月" },
  { value: "2", label: "2 月" },
  { value: "3", label: "3 月" },
  { value: "4", label: "4 月" },
  { value: "5", label: "5 月" },
  { value: "6", label: "6 月" },
  { value: "7", label: "7 月" },
  { value: "8", label: "8 月" },
  { value: "9", label: "9 月" },
  { value: "10", label: "10 月" },
  { value: "11", label: "11 月" },
  { value: "12", label: "12 月" },
];

/**
 * Get all available years within the configured range
 */
export function getAvailableYears(): string[] {
  const years: string[] = [];
  for (let year = TIME_RANGE_CONFIG.maxYear; year >= TIME_RANGE_CONFIG.minYear; year--) {
    years.push(year.toString());
  }
  return years;
}

/**
 * Get all available months
 */
export function getAvailableMonths() {
  return [
    { value: "1", label: "1 月" },
    { value: "2", label: "2 月" },
    { value: "3", label: "3 月" },
    { value: "4", label: "4 月" },
    { value: "5", label: "5 月" },
    { value: "6", label: "6 月" },
    { value: "7", label: "7 月" },
    { value: "8", label: "8 月" },
    { value: "9", label: "9 月" },
    { value: "10", label: "10 月" },
    { value: "11", label: "11 月" },
    { value: "12", label: "12 月" },
  ];
}

/**
 * Get month names array for chart labels
 */
export function getMonthNames(): string[] {
  return [
    "1 月", "2 月", "3 月", "4 月", "5 月", "6 月",
    "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"
  ];
}

/**
 * Check if a year is within the allowed range
 */
export function isValidYear(year: number): boolean {
  return year >= TIME_RANGE_CONFIG.minYear && year <= TIME_RANGE_CONFIG.maxYear;
}

/**
 * Check if a month is within the allowed range
 */
export function isValidMonth(month: number): boolean {
  return month >= TIME_RANGE_CONFIG.minMonth && month <= TIME_RANGE_CONFIG.maxMonth;
}

/**
 * Get the default date for the application
 */
export function getDefaultDate(): Date {
  return new Date(TIME_RANGE_CONFIG.defaultYear, TIME_RANGE_CONFIG.defaultMonth - 1, 1);
}

/**
 * Check if a date is within the allowed range
 */
export function isValidDate(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return isValidYear(year) && isValidMonth(month);
}

/**
 * Clamp a date to the allowed range
 */
export function clampDate(date: Date): Date {
  const year = Math.max(TIME_RANGE_CONFIG.minYear, Math.min(TIME_RANGE_CONFIG.maxYear, date.getFullYear()));
  const month = Math.max(TIME_RANGE_CONFIG.minMonth, Math.min(TIME_RANGE_CONFIG.maxMonth, date.getMonth() + 1));
  return new Date(year, month - 1, 1);
}