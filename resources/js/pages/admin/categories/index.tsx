import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, destroy, edit } from '@/routes/admin/categories';

type AdminCategory = {
    id: number;
    slug: string;
    name: string;
    image: string | null;
    products_count: number;
};

type CategoriesProps = {
    categories: AdminCategory[];
};

export default function AdminCategoriesIndex({ categories }: CategoriesProps) {
    const { status, error } = usePage<{ status?: string; error?: string }>()
        .props;

    const remove = (category: AdminCategory) => {
        if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(destroy(category.slug).url);
    };

    return (
        <>
            <Head title="Manage Categories" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Categories</h1>
                        <p className="text-sm text-muted-foreground">
                            {categories.length} categor
                            {categories.length === 1 ? 'y' : 'ies'}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                {status && (
                    <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        {status}
                    </p>
                )}
                {error && (
                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs font-semibold uppercase">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Slug</th>
                                <th className="p-3">Products</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td className="flex items-center gap-3 p-3 font-medium">
                                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        {category.name}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {category.slug}
                                    </td>
                                    <td className="p-3">
                                        {category.products_count}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                asChild
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <Link
                                                    href={edit(category.slug)}
                                                    aria-label={`Edit ${category.name}`}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => remove(category)}
                                                aria-label={`Delete ${category.name}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {categories.length === 0 && (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        No categories yet — add your first one.
                    </p>
                )}
            </div>
        </>
    );
}
