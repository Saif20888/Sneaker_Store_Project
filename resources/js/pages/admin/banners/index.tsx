import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, MoveDown, MoveUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { destroy, reorder, store } from '@/routes/admin/banners';

type Banner = {
    id: number;
    image: string;
};

type BannersProps = {
    banners: Banner[];
};

export default function AdminBannersIndex({ banners }: BannersProps) {
    const { status } = usePage<{ status?: string }>().props;
    const { data, setData, post, processing, errors, reset } = useForm<{
        images: File[];
    }>({ images: [] });

    const uploadImages = () => {
        if (data.images.length === 0) {
            return;
        }

        post(store().url, {
            forceFormData: true,
            onSuccess: () => reset('images'),
        });
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= banners.length) {
            return;
        }

        const reordered = [...banners];
        [reordered[index], reordered[target]] = [
            reordered[target],
            reordered[index],
        ];

        router.patch(
            reorder().url,
            { order: reordered.map((banner) => banner.id) },
            { preserveScroll: true },
        );
    };

    const remove = (banner: Banner) => {
        if (!confirm('Remove this homepage banner?')) {
            return;
        }

        router.delete(destroy(banner.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Home Banners" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Home Banners</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the rotating banner images shown at the top of
                        the homepage.
                    </p>
                </div>

                {status && (
                    <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        {status}
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    {banners.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No banners yet — the homepage will show its default
                            images until you add some.
                        </p>
                    ) : (
                        banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className="flex items-center gap-4 rounded-md border p-3"
                            >
                                <img
                                    src={banner.image}
                                    alt=""
                                    className="h-16 w-28 rounded-md border object-cover"
                                />
                                <span className="text-sm text-muted-foreground">
                                    Position {index + 1}
                                </span>
                                <div className="ml-auto flex items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={index === 0}
                                        onClick={() => move(index, -1)}
                                        aria-label="Move up"
                                    >
                                        <MoveUp className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={index === banners.length - 1}
                                        onClick={() => move(index, 1)}
                                        aria-label="Move down"
                                    >
                                        <MoveDown className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => remove(banner)}
                                        aria-label="Delete banner"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3">
                        {data.images.map((file, index) => (
                            <img
                                key={`${file.name}-${index}`}
                                src={URL.createObjectURL(file)}
                                alt=""
                                className="size-20 rounded-md border object-cover"
                            />
                        ))}

                        <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-ring hover:text-foreground">
                            <ImagePlus className="size-5" />
                            <span className="text-[10px] font-medium uppercase">
                                Add
                            </span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    setData('images', [
                                        ...data.images,
                                        ...Array.from(e.target.files ?? []),
                                    ]);
                                    e.target.value = '';
                                }}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {errors.images && (
                        <p className="text-xs text-destructive">
                            {errors.images}
                        </p>
                    )}

                    <Button
                        type="button"
                        disabled={processing || data.images.length === 0}
                        onClick={uploadImages}
                        className="w-fit"
                    >
                        Upload
                    </Button>
                </div>
            </div>
        </>
    );
}
