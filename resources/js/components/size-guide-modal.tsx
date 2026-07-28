import type { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const SIZE_CHART = [
    { eu: '40', us: '7', uk: '6', cm: '25.5' },
    { eu: '41', us: '8', uk: '7', cm: '26' },
    { eu: '42', us: '8.5', uk: '7.5', cm: '26.5' },
    { eu: '43', us: '9.5', uk: '8.5', cm: '27.5' },
    { eu: '44', us: '10', uk: '9', cm: '28' },
    { eu: '45', us: '11', uk: '10', cm: '29' },
];

export default function SizeGuideModal({ trigger }: { trigger: ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="rounded-sm sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold tracking-wide uppercase">
                        Size Guide
                    </DialogTitle>
                </DialogHeader>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-store-gray text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            <th className="py-2">EU</th>
                            <th className="py-2">US</th>
                            <th className="py-2">UK</th>
                            <th className="py-2">CM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SIZE_CHART.map((row) => (
                            <tr
                                key={row.eu}
                                className="border-b border-store-gray/60"
                            >
                                <td className="py-2 font-semibold">{row.eu}</td>
                                <td className="py-2">{row.us}</td>
                                <td className="py-2">{row.uk}</td>
                                <td className="py-2">{row.cm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="text-xs text-muted-foreground">
                    Measurements are approximate. For a snug fit, measure your
                    foot length and match to the CM column.
                </p>
            </DialogContent>
        </Dialog>
    );
}
