import { useForm } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CategoryFormValues = {
    name: string;
    slug: string;
    image: File | null;
    remove_image: boolean;
};

type CategoryFormProps = {
    submitUrl: string;
    submitMethod: 'post' | 'patch';
    submitLabel: string;
    initialValues?: Partial<CategoryFormValues> & {
        existingImage?: string | null;
    };
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function CategoryForm({
    submitUrl,
    submitMethod,
    submitLabel,
    initialValues,
}: CategoryFormProps) {
    const [slugTouched, setSlugTouched] = useState(
        Boolean(initialValues?.slug),
    );
    const [existingImage, setExistingImage] = useState(
        initialValues?.existingImage ?? null,
    );

    const { data, setData, post, transform, processing, errors } =
        useForm<CategoryFormValues>({
            name: '',
            slug: '',
            image: null,
            remove_image: false,
            ...initialValues,
        });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (submitMethod === 'patch') {
            transform((formData) => ({ ...formData, _method: 'patch' }));
        }

        post(submitUrl, { forceFormData: true });
    };

    const removeImage = () => {
        setExistingImage(null);
        setData('remove_image', true);
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => {
                        setData('name', e.target.value);

                        if (!slugTouched) {
                            setData('slug', slugify(e.target.value));
                        }
                    }}
                    required
                />
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => {
                        setSlugTouched(true);
                        setData('slug', e.target.value);
                    }}
                    required
                />
                {errors.slug && (
                    <p className="text-xs text-destructive">{errors.slug}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label>Image</Label>
                <p className="text-xs text-muted-foreground">
                    Shown on the homepage&apos;s Categories section.
                </p>

                <div className="flex flex-wrap gap-3">
                    {data.image ? (
                        <div className="relative">
                            <img
                                src={URL.createObjectURL(data.image)}
                                alt=""
                                className="size-20 rounded-md border object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setData('image', null)}
                                aria-label="Remove image"
                                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ) : existingImage ? (
                        <div className="relative">
                            <img
                                src={existingImage}
                                alt=""
                                className="size-20 rounded-md border object-cover"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                aria-label="Remove image"
                                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-ring hover:text-foreground">
                            <ImagePlus className="size-5" />
                            <span className="text-[10px] font-medium uppercase">
                                Add
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setData('image', file);
                                    setData('remove_image', false);
                                }}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
                {errors.image && (
                    <p className="text-xs text-destructive">{errors.image}</p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-fit">
                {submitLabel}
            </Button>
        </form>
    );
}
