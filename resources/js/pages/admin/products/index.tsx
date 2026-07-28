import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBdt } from '@/lib/currency';
import { create, destroy, edit, index } from '@/routes/admin/products';

type AdminProduct = {
    id: number;
    slug: string;
    name: string;
    brand: string;
    category: string;
    original_price: number;
    discount_price: number | null;
    image: string | null;
    total_stock: number;
    is_featured: boolean;
    is_trending: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Option = { id: number; name: string };

type Filters = {
    q: string;
    category: number | null;
    brand: number | null;
};

type ProductsProps = {
    products: {
        data: AdminProduct[];
        links: PaginationLink[];
        total: number;
    };
    filters: Filters;
    categories: Option[];
    brands: Option[];
};

export default function AdminProductsIndex({
    products,
    filters,
    categories,
    brands,
}: ProductsProps) {
    const { status } = usePage<{ status?: string; error?: string }>().props;
    const [query, setQuery] = useState(filters.q);

    const applyFilters = (next: Partial<Filters>) => {
        router.get(
            index().url,
            {
                q: next.q ?? query,
                category:
                    next.category !== undefined
                        ? next.category
                        : filters.category,
                brand: next.brand !== undefined ? next.brand : filters.brand,
            },
            { preserveState: true, replace: true },
        );
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ q: query });
    };

    const hasActiveFilters = Boolean(
        filters.q || filters.category || filters.brand,
    );

    const clearFilters = () => {
        setQuery('');
        router.get(index().url, {}, { preserveState: true, replace: true });
    };

    const remove = (product: AdminProduct) => {
        if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) {
            return;
        }

        router.delete(destroy(product.slug).url);
    };

    return (
        <>
            <Head title="Manage Products" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Products</h1>
                        <p className="text-sm text-muted-foreground">
                            {products.total} product
                            {products.total === 1 ? '' : 's'} in the catalog
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>

                {status && (
                    <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        {status}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <form
                        onSubmit={submitSearch}
                        className="flex max-w-sm flex-1 items-center gap-2"
                    >
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by product name"
                        />
                        <Button type="submit" size="icon" variant="outline">
                            <Search className="size-4" />
                        </Button>
                    </form>

                    <select
                        value={filters.category ?? ''}
                        onChange={(event) =>
                            applyFilters({
                                category: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                            })
                        }
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.brand ?? ''}
                        onChange={(event) =>
                            applyFilters({
                                brand: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                            })
                        }
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                        <option value="">All Brands</option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={clearFilters}
                        >
                            <X className="size-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {products.data.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        {hasActiveFilters
                            ? 'No products match your search or filters.'
                            : 'No products yet — add your first one.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase">
                                <tr>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Brand</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.data.map((product) => (
                                    <tr key={product.id}>
                                        <td className="flex items-center gap-3 p-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="size-full object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                            <span className="font-medium">
                                                {product.name}
                                            </span>
                                        </td>
                                        <td className="p-3">{product.brand}</td>
                                        <td className="p-3">
                                            {product.category}
                                        </td>
                                        <td className="p-3">
                                            {product.discount_price ? (
                                                <>
                                                    <span className="text-muted-foreground line-through">
                                                        {formatBdt(
                                                            product.original_price,
                                                        )}
                                                    </span>{' '}
                                                    {formatBdt(
                                                        product.discount_price,
                                                    )}
                                                </>
                                            ) : (
                                                formatBdt(
                                                    product.original_price,
                                                )
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {product.total_stock}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Link
                                                        href={edit(
                                                            product.slug,
                                                        )}
                                                        aria-label={`Edit ${product.name}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        remove(product)
                                                    }
                                                    aria-label={`Delete ${product.name}`}
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
                )}

                {products.links.length > 3 && (
                    <nav className="flex flex-wrap gap-1">
                        {products.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                className={`rounded-md px-3 py-1.5 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted'
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </>
    );
}
