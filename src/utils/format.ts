
export function formatLargeNumber(value: number, decimals: number = 2): string {
    if (value === 0) return '0';

    return formatNumberWithCommas(Math.round(value));
}


export function formatCurrency(value: number, decimals: number = 2): string {
    return `$${formatLargeNumber(value, decimals)}`;
}

export function formatNumberWithCommas(value: number): string {
    return value.toLocaleString('en-US');
}