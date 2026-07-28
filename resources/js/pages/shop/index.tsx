import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/product-card';
import type { ProductCardData } from '@/components/product-card';
import { Checkbox } from '@/components/ui/checkbox';
import { formatBdt } from '@/lib/currency';
import { index as shopIndex } from '@/routes/products';

type Brand = { id: number; name: string; slug: string };
type Category = { id: number; name: string; slug: string };

type Filters = {
    brand?: string[];
    category?: string[];
    size?: string;
    min_price?: string;
    max_price?: string;
    q?: string;
    sort?: string;
    in_stock?: string;
    discounted?: string;
};

type CatalogProps = {
    products: ProductCardData[];
    brands: Brand[];
    categories: Category[];
    sizes: string[];
    filters: Filters;
};

const PRICE_FLOOR = 0;
const PRICE_CEILING = 25000;

const SORT_OPTIONS = [
    { value: '', label: 'Featured' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

const QUICK_TABS = [
    { key: 'all', label: 'All' },
    { key: 'in_stock', label: 'In Stock' },
    { key: 'discount', label: 'Discount' },
] as const;

type QuickTab = (typeof QUICK_TABS)[number]['key'];

type FilterState = {
    q: string;
    brand: string[];
    category: string[];
    size: string;
    minPrice: number;
    maxPrice: number;
    inStockOnly: boolean;
    discounted: boolean;
    sort: string;
};

function initialFilterState(filters: Filters): FilterState {
    return {
        q: filters.q ?? '',
        brand: filters.brand ?? [],
        category: filters.category ?? [],
        size: filters.size ?? '',
        minPrice: Number(filters.min_price ?? PRICE_FLOOR),
        maxPrice: Number(filters.max_price ?? PRICE_CEILING),
        inStockOnly: filters.in_stock === '1',
        discounted: filters.discounted === '1',
        sort: filters.sort ?? '',
    };
}

export default function ShopIndex({
    products,
    brands,
    categories,
    sizes,
    filters,
}: CatalogProps) {
    const [state, setState] = useState<FilterState>(() =>
        initialFilterState(filters),
    );
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                shopIndex().url,
                {
                    q: state.q || undefined,
                    brand: state.brand.length > 0 ? state.brand : undefined,
                    category:
                        state.category.length > 0 ? state.category : undefined,
                    size: state.size || undefined,
                    min_price:
                        state.minPrice !== PRICE_FLOOR
                            ? state.minPrice
                            : undefined,
                    max_price:
                        state.maxPrice !== PRICE_CEILING
                            ? state.maxPrice
                            : undefined,
                    in_stock: state.inStockOnly ? '1' : undefined,
                    discounted: state.discounted ? '1' : undefined,
                    sort: state.sort || undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [state]);

    const toggleBrand = (slug: string) => {
        setState((current) => ({
            ...current,
            brand: current.brand.includes(slug)
                ? current.brand.filter((b) => b !== slug)
                : [...current.brand, slug],
        }));
    };

    const toggleCategory = (slug: string) => {
        setState((current) => ({
            ...current,
            category: current.category.includes(slug)
                ? current.category.filter((c) => c !== slug)
                : [...current.category, slug],
        }));
    };

    const activeTab: QuickTab = state.discounted
        ? 'discount'
        : state.inStockOnly
          ? 'in_stock'
          : 'all';

    const selectTab = (tab: QuickTab) => {
        setState((current) => ({
            ...current,
            inStockOnly: tab === 'in_stock',
            discounted: tab === 'discount',
        }));
    };

    const clearFilters = () => {
        setState({
            q: '',
            brand: [],
            category: [],
            size: '',
            minPrice: PRICE_FLOOR,
            maxPrice: PRICE_CEILING,
            inStockOnly: false,
            discounted: false,
            sort: '',
        });
    };

    const hasActiveFilters =
        state.q ||
        state.brand.length > 0 ||
        state.category.length > 0 ||
        state.size ||
        state.minPrice !== PRICE_FLOOR ||
        state.maxPrice !== PRICE_CEILING ||
        state.inStockOnly ||
        state.discounted ||
        state.sort;

    return (
        <>
            <Head title="Shop All Sneakers" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight uppercase">
                            Shop All
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {products.length} sneaker
                            {products.length === 1 ? '' : 's'}
                        </p>
                        {state.q && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Searching &ldquo;{state.q}&rdquo;{' '}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setState((current) => ({
                                            ...current,
                                            q: '',
                                        }))
                                    }
                                    className="font-semibold text-store-alert underline underline-offset-2"
                                >
                                    Clear
                                </button>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                            value={state.sort}
                            onChange={(e) =>
                                setState((current) => ({
                                    ...current,
                                    sort: e.target.value,
                                }))
                            }
                            className="rounded-sm border border-store-gray bg-white px-3 py-2 text-sm text-store-ink outline-none focus-visible:border-store-ink"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-8 flex gap-2 border-b border-store-gray">
                    {QUICK_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => selectTab(tab.key)}
                            className={`-mb-px border-b-2 px-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                                activeTab === tab.key
                                    ? 'border-store-alert text-store-ink'
                                    : 'border-transparent text-muted-foreground hover:text-store-ink'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                    <aside className="flex flex-col gap-6">
                        <div>
                            <span className="mb-2 block text-xs font-semibold tracking-wide uppercase">
                                Price: {formatBdt(state.minPrice)} –{' '}
                                {formatBdt(state.maxPrice)}
                            </span>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="range"
                                    min={PRICE_FLOOR}
                                    max={PRICE_CEILING}
                                    step={500}
                                    value={state.minPrice}
                                    onChange={(e) =>
                                        setState((current) => ({
                                            ...current,
                                            minPrice: Math.min(
                                                Number(e.target.value),
                                                current.maxPrice,
                                            ),
                                        }))
                                    }
                                    className="w-full accent-store-ink"
                                    aria-label="Minimum price"
                                />
                                <input
                                    type="range"
                                    min={PRICE_FLOOR}
                                    max={PRICE_CEILING}
                                    step={500}
                                    value={state.maxPrice}
                                    onChange={(e) =>
                                        setState((current) => ({
                                            ...current,
                                            maxPrice: Math.max(
                                                Number(e.target.value),
                                                current.minPrice,
                                            ),
                                        }))
                                    }
                                    className="w-full accent-store-ink"
                                    aria-label="Maximum price"
                                />
                            </div>
                        </div>

                        <div>
                            <span className="mb-2 block text-xs font-semibold tracking-wide uppercase">
                                Brand
                            </span>
                            <div className="flex flex-col gap-2">
                                {brands.map((b) => (
                                    <label
                                        key={b.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={state.brand.includes(
                                                b.slug,
                                            )}
                                            onCheckedChange={() =>
                                                toggleBrand(b.slug)
                                            }
                                        />
                                        {b.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="mb-2 block text-xs font-semibold tracking-wide uppercase">
                                Category
                            </span>
                            <div className="flex flex-col gap-2">
                                {categories.map((c) => (
                                    <label
                                        key={c.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={state.category.includes(
                                                c.slug,
                                            )}
                                            onCheckedChange={() =>
                                                toggleCategory(c.slug)
                                            }
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="mb-2 block text-xs font-semibold tracking-wide uppercase">
                                Size (EU)
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                                {sizes.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() =>
                                            setState((current) => ({
                                                ...current,
                                                size:
                                                    current.size === s ? '' : s,
                                            }))
                                        }
                                        className={`rounded-sm border py-1.5 text-xs font-medium ${
                                            state.size === s
                                                ? 'border-store-ink bg-store-ink text-store-bone'
                                                : 'border-store-gray hover:border-store-ink'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="w-fit text-xs font-medium text-store-alert underline underline-offset-2"
                            >
                                Clear all filters
                            </button>
                        )}
                    </aside>

                    <div>
                        {products.length === 0 ? (
                            <p className="py-16 text-center text-sm text-muted-foreground">
                                No products match your filters.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.slug}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
