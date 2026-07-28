export function formatCustomerId(id: number): string {
    return `CUS-${String(id).padStart(6, '0')}`;
}

export function formatOrderCustomerId(
    userId: number | null,
    guestId: string | null,
): string {
    if (userId) {
        return formatCustomerId(userId);
    }

    return guestId ?? 'Guest';
}
