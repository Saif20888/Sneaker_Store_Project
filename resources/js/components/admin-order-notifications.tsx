import { Link, usePage, usePoll } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { index as ordersIndex } from '@/routes/admin/orders';

export default function AdminOrderNotifications() {
    const { pendingOrdersCount } = usePage<{ pendingOrdersCount: number }>()
        .props;
    const previousCount = useRef(pendingOrdersCount);

    usePoll(15000, { only: ['pendingOrdersCount'] });

    useEffect(() => {
        if (pendingOrdersCount > previousCount.current) {
            const received = pendingOrdersCount - previousCount.current;
            toast.info(
                received === 1
                    ? 'New order received.'
                    : `${received} new orders received.`,
            );
        }

        previousCount.current = pendingOrdersCount;
    }, [pendingOrdersCount]);

    return (
        <Link
            href={ordersIndex({ query: { status: 'pending' } }).url}
            className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={`${pendingOrdersCount} orders received`}
        >
            <Bell className="size-4" />
            {pendingOrdersCount > 0 && (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-store-alert text-[10px] font-bold text-white">
                    {pendingOrdersCount > 9 ? '9+' : pendingOrdersCount}
                </span>
            )}
        </Link>
    );
}
