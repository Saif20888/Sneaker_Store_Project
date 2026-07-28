export const DELIVERY_ZONES = [
    { value: 'inside_dhaka', label: 'Inside Dhaka', fee: 80 },
    { value: 'outside_dhaka', label: 'Outside Dhaka', fee: 150 },
] as const;

export type DeliveryZoneValue = (typeof DELIVERY_ZONES)[number]['value'];

export function feeForZone(zone: DeliveryZoneValue): number {
    return (
        DELIVERY_ZONES.find((z) => z.value === zone)?.fee ??
        DELIVERY_ZONES[0].fee
    );
}
