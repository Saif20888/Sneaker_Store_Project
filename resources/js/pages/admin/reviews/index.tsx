import { Head, router, usePage } from '@inertiajs/react';
import { Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { approve, destroy } from '@/routes/admin/reviews';

type ReviewRow = {
    id: number;
    name: string;
    city: string | null;
    rating: number;
    comment: string;
    is_approved: boolean;
    created_at: string;
};

type AdminReviewsProps = {
    reviews: ReviewRow[];
};

export default function AdminReviewsIndex({ reviews }: AdminReviewsProps) {
    const { status } = usePage<{ status?: string }>().props;

    const approveReview = (review: ReviewRow) => {
        router.patch(approve(review.id).url, {}, { preserveScroll: true });
    };

    const deleteReview = (review: ReviewRow) => {
        if (!confirm(`Delete this review from ${review.name}?`)) {
            return;
        }

        router.delete(destroy(review.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Reviews" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Reviews</h1>
                    <p className="text-sm text-muted-foreground">
                        Approve customer reviews to show them on the
                        homepage.
                    </p>
                </div>

                {status && (
                    <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        {status}
                    </p>
                )}

                {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No reviews submitted yet.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {reviews.map((review) => (
                            <Card key={review.id}>
                                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold">
                                                {review.name}
                                            </span>
                                            {review.city && (
                                                <span className="text-xs text-muted-foreground">
                                                    {review.city}
                                                </span>
                                            )}
                                            <Badge
                                                className={
                                                    review.is_approved
                                                        ? 'border-transparent bg-emerald-100 text-emerald-800'
                                                        : 'border-transparent bg-amber-100 text-amber-800'
                                                }
                                            >
                                                {review.is_approved
                                                    ? 'Approved'
                                                    : 'Pending'}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-0.5 text-store-alert">
                                            {Array.from({ length: 5 }).map(
                                                (_, index) => (
                                                    <Star
                                                        key={index}
                                                        className={`size-3.5 ${index < review.rating ? 'fill-current' : ''}`}
                                                    />
                                                ),
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {review.comment}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {review.created_at}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {!review.is_approved && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                    approveReview(review)
                                                }
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            aria-label="Delete review"
                                            onClick={() =>
                                                deleteReview(review)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
