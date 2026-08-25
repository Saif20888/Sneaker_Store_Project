import { useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/reviews';

type ReviewForm = {
    name: string;
    city: string;
    rating: number;
    comment: string;
};

export default function WriteReviewModal({ trigger }: { trigger: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const { data, setData, post, processing, errors, reset } =
        useForm<ReviewForm>({
            name: '',
            city: '',
            rating: 0,
            comment: '',
        });

    const submit = () => {
        post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    setSubmitted(false);
                }
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="rounded-sm sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold tracking-wide uppercase">
                        Write a Review
                    </DialogTitle>
                </DialogHeader>

                {submitted ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Thanks for your review! It&apos;ll appear on the site
                        once approved.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="review-name">Name</Label>
                            <Input
                                id="review-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="review-city">
                                City (optional)
                            </Label>
                            <Input
                                id="review-city"
                                value={data.city}
                                onChange={(e) =>
                                    setData('city', e.target.value)
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Rating</Label>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const value = index + 1;

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setData('rating', value)
                                            }
                                            onMouseEnter={() =>
                                                setHoveredStar(value)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredStar(0)
                                            }
                                            aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
                                        >
                                            <Star
                                                className={`size-6 ${
                                                    value <=
                                                    (hoveredStar ||
                                                        data.rating)
                                                        ? 'fill-store-alert text-store-alert'
                                                        : 'text-store-gray'
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.rating && (
                                <p className="text-xs text-destructive">
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="review-comment">
                                Your Review
                            </Label>
                            <textarea
                                id="review-comment"
                                rows={4}
                                value={data.comment}
                                onChange={(e) =>
                                    setData('comment', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            {errors.comment && (
                                <p className="text-xs text-destructive">
                                    {errors.comment}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            disabled={processing}
                            onClick={submit}
                            className="rounded-sm bg-store-ink text-store-bone hover:bg-store-ink/90"
                        >
                            Submit Review
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
