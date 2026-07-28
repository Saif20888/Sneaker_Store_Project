import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, Star, Truck, Wallet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import HeroCarousel from '@/components/hero-carousel';
import ProductCard from '@/components/product-card';
import type { ProductCardData } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { index as shopIndex } from '@/routes/products';

type HomeCategory = { name: string; slug: string; image: string };

type HomeProps = {
    bestSellers: ProductCardData[];
    featured: ProductCardData[];
    latest: ProductCardData[];
    brands: { id: number; name: string; slug: string }[];
    banners: string[];
    categories: HomeCategory[];
};

const BRAND_LOGOS: Record<string, string> = {
    nike: '/images/brands/nike.svg',
    adidas: '/images/brands/adidas.svg',
    'new-balance': '/images/brands/new-balance.svg',
    puma: '/images/brands/puma.svg',
    'vint-edge': '/images/brand/logo-mark.webp',
};

const WHY_CHOOSE_US = [
    {
        icon: Wallet,
        title: 'Cash on Delivery',
        description:
            'Pay when your kicks arrive at your door. No advance payment required nationwide.',
    },
    {
        icon: Truck,
        title: 'Nationwide Delivery',
        description:
            'Fast dispatch on every order — Dhaka, Chittagong, Sylhet, and everywhere in between.',
    },
    {
        icon: BadgeCheck,
        title: 'Real Discounts, Every Day',
        description:
            'No inflated markups. Every price you see is the price you pay, discount included.',
    },
];

const REVIEWS = [
    {
        name: 'Rafiul Islam',
        city: 'Dhaka',
        quote: 'Copped the SB Dunk Low J-Pack Shadow and it arrived next day, exactly as pictured. COD made it risk-free.',
    },
    {
        name: 'Nusrat Jahan',
        city: 'Chittagong',
        quote: 'Was skeptical about ordering sneakers online outside Dhaka but delivery only took 3 days and everything matched the listing.',
    },
    {
        name: 'Tanvir Ahmed',
        city: 'Sylhet',
        quote: 'Best sneaker plug in Bangladesh. Ordered the Air Jordan 1 Panda High, sizing was spot on thanks to their size guide.',
    },
];

export default function Home({
    bestSellers,
    featured,
    latest,
    brands,
    banners,
    categories,
}: HomeProps) {
    const bestSellersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = bestSellersRef.current;

        if (!track || bestSellers.length === 0) {
            return;
        }

        const interval = setInterval(() => {
            const card = track.querySelector<HTMLElement>(':scope > div');
            const step = card ? card.offsetWidth + 16 : track.clientWidth;
            const atEnd =
                track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

            track.scrollTo({
                left: atEnd ? 0 : track.scrollLeft + step,
                behavior: 'smooth',
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [bestSellers.length]);

    return (
        <>
            <Head title="Curated Kicks, Real Prices" />

            <section className="animate-in duration-700 fade-in">
                <HeroCarousel slides={banners} />

                <div className="flex flex-col items-center gap-3 border-b border-store-gray bg-store-ink px-4 py-8 text-center text-store-bone sm:flex-row sm:justify-between sm:text-left">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.3em] text-store-alert uppercase">
                            Stay Elegant
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                            Curated Kicks, Real Prices
                        </h1>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="w-fit rounded-sm bg-store-bone text-store-ink hover:bg-store-bone/90"
                    >
                        <Link href={shopIndex()}>Shop All Sneakers</Link>
                    </Button>
                </div>
            </section>

            {brands.length > 0 && (
                <div className="overflow-hidden border-b border-store-gray bg-store-bone py-6">
                    <p className="mb-4 text-center text-[10px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
                        Brands We Carry
                    </p>
                    <div className="flex animate-[marquee-sixth_30s_linear_infinite] items-center gap-16 whitespace-nowrap">
                        {Array.from({ length: 6 }, () => brands)
                            .flat()
                            .map((brand, index) =>
                                BRAND_LOGOS[brand.slug] ? (
                                    <img
                                        key={`${brand.id}-${index}`}
                                        src={BRAND_LOGOS[brand.slug]}
                                        alt={brand.name}
                                        title={brand.name}
                                        className="h-6 w-auto shrink-0 opacity-70 grayscale transition-opacity hover:opacity-100 sm:h-8"
                                    />
                                ) : (
                                    <span
                                        key={`${brand.id}-${index}`}
                                        className="shrink-0 text-sm font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        {brand.name}
                                    </span>
                                ),
                            )}
                    </div>
                </div>
            )}

            {categories.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-end justify-between">
                        <h2 className="text-2xl font-extrabold tracking-tight uppercase">
                            Categories
                        </h2>
                        <Link
                            href={shopIndex()}
                            className="flex items-center gap-1 text-xs font-semibold tracking-widest uppercase underline underline-offset-4"
                        >
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {categories.map((category, index) => (
                            <Link
                                key={category.slug}
                                href={
                                    shopIndex({
                                        query: { category: [category.slug] },
                                    }).url
                                }
                                className="group flex flex-col gap-2"
                            >
                                <div
                                    className="aspect-square [animation:float-box_4s_ease-in-out_infinite] overflow-hidden rounded-2xl bg-store-gray/40"
                                    style={{
                                        animationDelay: `${index * 0.3}s`,
                                    }}
                                >
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <span className="text-center text-sm font-semibold tracking-wide uppercase">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <h2 className="text-2xl font-extrabold tracking-tight uppercase">
                        Best Sellers
                    </h2>
                    <Link
                        href={shopIndex()}
                        className="text-xs font-semibold tracking-widest uppercase underline underline-offset-4"
                    >
                        Shop All
                    </Link>
                </div>

                {bestSellers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No best sellers yet — check back soon.
                    </p>
                ) : (
                    <div
                        ref={bestSellersRef}
                        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-4"
                    >
                        {bestSellers.map((product) => (
                            <div
                                key={product.slug}
                                className="w-40 shrink-0 sm:w-56"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="border-y border-store-gray bg-store-cream/40">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight uppercase">
                        Why Choose Vint-Edge
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-3">
                        {WHY_CHOOSE_US.map(
                            ({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="flex flex-col items-center gap-3 rounded-sm border border-store-gray bg-store-bone p-6 text-center shadow-sm"
                                >
                                    <span className="flex size-14 items-center justify-center rounded-full bg-store-alert/10">
                                        <Icon className="size-6 text-store-alert" />
                                    </span>
                                    <h3 className="text-sm font-bold tracking-wide text-store-ink uppercase">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {featured.length > 0 && (
                <section className="bg-store-gray/30">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <h2 className="mb-8 text-2xl font-extrabold tracking-tight uppercase">
                            Featured Products
                        </h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
                            {featured.map((product) => (
                                <ProductCard
                                    key={product.slug}
                                    product={product}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {latest.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <h2 className="mb-8 text-2xl font-extrabold tracking-tight uppercase">
                        Latest Products
                    </h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
                        {latest.map((product) => (
                            <ProductCard key={product.slug} product={product} />
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl border-t border-store-gray px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-center text-2xl font-extrabold tracking-tight uppercase">
                    What Bangladesh Is Saying
                </h2>
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
                    {REVIEWS.map((review) => (
                        <div
                            key={review.name}
                            className="w-72 shrink-0 snap-start rounded-sm border border-store-gray bg-store-cream/30 p-5 shadow-sm sm:w-96"
                        >
                            <div className="flex gap-0.5 text-store-alert">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                        key={index}
                                        className="size-3.5 fill-current"
                                    />
                                ))}
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                &ldquo;{review.quote}&rdquo;
                            </p>
                            <p className="mt-3 text-xs font-semibold tracking-wide uppercase">
                                {review.name} · {review.city}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
