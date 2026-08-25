import { Badge } from '@/components/ui/badge';

const STATUS_STYLES: Record<string, string> = {
    pending: 'border-transparent bg-amber-100 text-amber-800',
    processing: 'border-transparent bg-blue-100 text-blue-800',
    shipped: 'border-transparent bg-indigo-100 text-indigo-800',
    delivered: 'border-transparent bg-emerald-100 text-emerald-800',
    cancelled: 'border-transparent bg-red-100 text-red-800',
    returned: 'border-transparent bg-orange-100 text-orange-800',
};

export default function OrderStatusBadge({
    status,
    label,
}: {
    status: string;
    label: string;
}) {
    return <Badge className={STATUS_STYLES[status] ?? ''}>{label}</Badge>;
}
