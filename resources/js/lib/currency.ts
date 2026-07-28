export function formatBdt(amount: number): string {
    return `৳ ${Math.round(amount).toLocaleString('en-US')}`;
}
