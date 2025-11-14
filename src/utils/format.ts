/**
 * Format large numbers to abbreviated form (K/M/B)
 * Examples:
 * - 1234 → 1.23K
 * - 307318135 → 307.32M
 * - 5000000000 → 5.00B
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
    if (value === 0) return '0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1_000_000_000) {
        // Billions
        return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
    } else if (absValue >= 1_000_000) {
        // Millions
        return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
    } else if (absValue >= 1_000) {
        // Thousands
        return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
    } else {
        // Less than 1000
        return `${sign}${absValue.toFixed(decimals)}`;
    }
}

/**
 * Format currency with $ sign
 * Examples:
 * - 1234 → $1.23K
 * - 307318135 → $307.32M
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
