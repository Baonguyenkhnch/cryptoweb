/**
 * Format large numbers with commas (NO abbreviation K/M/B)
 * Examples:
 * - 1234 → 1,234
 * - 307318135 → 307,318,135
 * - 5000000000 → 5,000,000,000
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
    if (value === 0) return '0';

    // ✅ NEW: Always show full number with commas
    return formatNumberWithCommas(Math.round(value));
}

/**
 * Format currency with $ sign and commas (NO abbreviation)
 * Examples:
 * - 1234 → $1,234
 * - 307318135 → $307,318,135
 * - 5000000000 → $5,000,000,000
 */
export function formatCurrency(value: number, decimals: number = 2): string {
    return `$${formatLargeNumber(value, decimals)}`;
}

/**
 * Format number with commas
 * Examples:
 * - 1234 → 1,234
 * - 307318135 → 307,318,135
 */
export function formatNumberWithCommas(value: number): string {
    return value.toLocaleString('en-US');
}