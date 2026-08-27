import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Heart,
    LayoutGrid,
    LogOut,
    Menu,
    PackageSearch,
    Search,
    ShoppingBag,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import CartDrawer from '@/components/cart-drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import WhatsAppFloat from '@/components/whatsapp-float';
import { CartProvider, useCart } from '@/hooks/use-cart';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useWishlist } from '@/hooks/use-wishlist';
import { dashboard, home, login, logout } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as dropsIndex } from '@/routes/drops';
import { store as subscribeNewsletter } from '@/routes/newsletter';
import { index as orderHistoryIndex } from '@/routes/orders';
import {
    about as aboutUsPage,
    cancellationPolicy as cancellationPolicyPage,
    contact as contactUsPage,
    privacy as privacyPage,
    refundPolicy as refundPolicyPage,
    returnPolicy as returnPolicyPage,
    terms as termsPage,
} from '@/routes/pages';
import { index as shopIndex } from '@/routes/products';
import { edit as profileEdit } from '@/routes/profile';
import { index as storesIndex } from '@/routes/stores';
import { index as trackOrderIndex } from '@/routes/track-order';
import { index as wishlistIndex } from '@/routes/wishlist';
import type { User } from '@/types/auth';
import type { Team } from '@/types/teams';

type StoreCategory = { id: number; name: string; slug: string };

const NAV_LINKS = [
    { label: 'Home', href: home() },
    { label: 'Shop', href: shopIndex() },
    { label: 'New Arrivals', href: dropsIndex() },
    { label: 'Stores', href: storesIndex() },
    { label: 'Track Order', href: trackOrderIndex() },
    { label: 'About Us', href: aboutUsPage() },
    { label: 'Contact Us', href: contactUsPage() },
];

function categoryHref(slug: string): string {
    return `${shopIndex().url}?category=${encodeURIComponent(slug)}`;
}

function StoreHeader() {
    const { count, openCart } = useCart();
    const { count: wishlistCount } = useWishlist();
    const { isCurrentUrl } = useCurrentUrl();
    const { storeCategories, auth, currentTeam } = usePage<{
        storeCategories: StoreCategory[];
        auth: { user: User | null };
        currentTeam: Team | null;
    }>().props;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(shopIndex().url, searchTerm ? { q: searchTerm } : {});
    };

    return (
        <header className="sticky top-0 z-40 border-b border-store-gray bg-store-bone/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                <Link href={home()} className="flex shrink-0 items-center">
                    <img
                        src="/images/brand/logo.webp"
                        alt="Vint-Edge"
                        className="h-9 w-auto sm:h-11"
                    />
                </Link>

                <nav className="hidden items-center gap-7 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-colors ${
                                isCurrentUrl(link.href)
                                    ? 'text-store-ink underline decoration-store-alert decoration-2 underline-offset-8'
                                    : 'text-muted-foreground hover:text-store-ink'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-5">
                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1.5 text-store-ink outline-none">
                                <UserIcon className="size-5" />
                                <span className="hidden text-xs font-semibold tracking-wide uppercase sm:inline">
                                    {auth.user.name.split(' ')[0]}
                                </span>
                                <ChevronDown className="size-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {auth.user.is_admin && currentTeam && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={dashboard(currentTeam.slug)}
                                        >
                                            <LayoutGrid className="mr-2 size-4" />
                                            Home
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href={profileEdit()}>
                                        <UserIcon className="mr-2 size-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={orderHistoryIndex()}>
                                        <PackageSearch className="mr-2 size-4" />
                                        Order History
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        className="w-full cursor-pointer"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href={login()}
                            className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-store-ink uppercase"
                        >
                            <UserIcon className="size-5" />
                            <span className="hidden sm:inline">Sign In</span>
                        </Link>
                    )}

                    <Link
                        href={wishlistIndex()}
                        className="relative flex items-center text-store-ink"
                        aria-label={`Wish list, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`}
                    >
                        <Heart className="size-5" />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-store-alert text-[10px] font-bold text-white">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={openCart}
                        className="relative flex items-center gap-2 text-store-ink"
                        aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
                    >
                        <ShoppingBag className="size-5" />
                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-store-alert text-[10px] font-bold text-white">
                                {count}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileNavOpen(true)}
                        className="text-store-ink lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="size-6" />
                    </button>
                </div>
            </div>

            <div className="hidden border-t border-store-gray md:block">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-9 shrink-0 items-center gap-1 rounded-l-sm border border-r-0 border-store-gray bg-store-cream/40 px-3 text-xs font-semibold tracking-wide whitespace-nowrap uppercase outline-none hover:bg-store-cream">
                            Categories
                            <ChevronDown className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {storeCategories?.map((category) => (
                                <DropdownMenuItem key={category.slug} asChild>
                                    <Link
                                        href={categoryHref(category.slug)}
                                        className="cursor-pointer"
                                    >
                                        {category.name}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <form
                        onSubmit={submitSearch}
                        className="flex h-9 w-full max-w-md items-stretch"
                    >
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search sneakers…"
                            className="w-full min-w-0 border border-store-gray bg-white px-3 text-sm text-store-ink outline-none placeholder:text-muted-foreground focus-visible:border-store-ink"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="flex w-10 shrink-0 items-center justify-center rounded-r-sm border border-l-0 border-store-gray bg-store-ink text-store-bone hover:bg-store-ink/90"
                        >
                            <Search className="size-4" />
                        </button>
                    </form>
                </div>
            </div>

            <form
                onSubmit={submitSearch}
                className="flex h-11 items-stretch border-t border-store-gray px-4 sm:px-6 md:hidden"
            >
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sneakers…"
                    className="my-1.5 w-full min-w-0 rounded-l-sm border border-store-gray bg-white px-3 text-sm text-store-ink outline-none placeholder:text-muted-foreground focus-visible:border-store-ink"
                />
                <button
                    type="submit"
                    aria-label="Search"
                    className="my-1.5 flex w-10 shrink-0 items-center justify-center rounded-r-sm border border-l-0 border-store-gray bg-store-ink text-store-bone"
                >
                    <Search className="size-4" />
                </button>
            </form>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent
                    side="left"
                    className="w-full gap-0 p-0 sm:max-w-xs"
                >
                    <SheetHeader className="border-b border-store-gray">
                        <SheetTitle>
                            <img
                                src="/images/brand/logo.webp"
                                alt="Vint-Edge"
                                className="h-8 w-auto"
                            />
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1 p-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileNavOpen(false)}
                                className={`px-2 py-3 text-sm font-semibold tracking-wide uppercase ${
                                    isCurrentUrl(link.href)
                                        ? 'text-store-ink'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <span className="mt-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Categories
                        </span>
                        {storeCategories?.map((category) => (
                            <Link
                                key={category.slug}
                                href={categoryHref(category.slug)}
                                onClick={() => setMobileNavOpen(false)}
                                className="px-2 py-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                {category.name}
                            </Link>
                        ))}

                        <Link
                            href={wishlistIndex()}
                            onClick={() => setMobileNavOpen(false)}
                            className="px-2 py-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                        >
                            Wish List
                        </Link>
                        <Link
                            href={cartIndex()}
                            onClick={() => setMobileNavOpen(false)}
                            className="px-2 py-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                        >
                            Your Bag
                        </Link>

                        <div className="mt-2 border-t border-store-gray pt-2">
                            {auth.user ? (
                                <>
                                    {auth.user.is_admin && currentTeam && (
                                        <Link
                                            href={dashboard(currentTeam.slug)}
                                            onClick={() =>
                                                setMobileNavOpen(false)
                                            }
                                            className="block px-2 py-3 text-sm font-semibold tracking-wide text-store-ink uppercase"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link
                                        href={profileEdit()}
                                        onClick={() => setMobileNavOpen(false)}
                                        className="block px-2 py-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                                    >
                                        Profile ({auth.user.name.split(' ')[0]})
                                    </Link>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        onClick={() => setMobileNavOpen(false)}
                                        className="block w-full px-2 py-3 text-left text-sm font-semibold tracking-wide text-muted-foreground uppercase"
                                    >
                                        Log Out
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={login()}
                                    onClick={() => setMobileNavOpen(false)}
                                    className="block px-2 py-3 text-sm font-semibold tracking-wide text-store-ink uppercase"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}

function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sent'>('idle');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            subscribeNewsletter().url,
            { email },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStatus('sent');
                    setEmail('');
                },
            },
        );
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-2">
            <label
                htmlFor="newsletter-email"
                className="text-xs text-store-bone/70"
            >
                Your Email Address
            </label>
            <div className="flex">
                <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-w-0 rounded-l-sm border border-store-bone/20 bg-store-bone/5 px-3 py-2 text-sm text-store-bone outline-none placeholder:text-store-bone/40 focus-visible:border-store-bone/50"
                />
                <button
                    type="submit"
                    className="shrink-0 rounded-r-sm bg-store-alert px-4 text-xs font-bold tracking-wide text-white uppercase hover:bg-store-alert/90"
                >
                    Subscribe
                </button>
            </div>
            {status === 'sent' && (
                <p className="text-xs text-store-bone/70">
                    Thanks — you&apos;re on the list.
                </p>
            )}
        </form>
    );
}

const SPECIAL_LINKS = [
    { label: 'Featured Products', href: `${shopIndex().url}` },
    { label: 'Latest Products', href: `${shopIndex().url}?sort=newest` },
    {
        label: 'Best Selling Products',
        href: `${shopIndex().url}`,
    },
    { label: 'Top Rated Products', href: `${shopIndex().url}` },
];

const ACCOUNT_LINKS = [
    { label: 'Profile Info', href: profileEdit() },
    { label: 'Wish List', href: wishlistIndex() },
    { label: 'Track Order', href: trackOrderIndex() },
    { label: 'Refund policy', href: refundPolicyPage() },
    { label: 'Return policy', href: returnPolicyPage() },
    { label: 'Cancellation policy', href: cancellationPolicyPage() },
];

function StoreFooter() {
    return (
        <footer className="border-t border-store-gray bg-store-ink text-store-bone">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="inline-block rounded-sm bg-store-bone p-2">
                            <img
                                src="/images/brand/logo.webp"
                                alt="Vint-Edge"
                                className="h-8 w-auto"
                            />
                        </div>
                        <p className="mt-3 text-sm text-store-bone/70">
                            Curated Kicks, Real Prices.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold tracking-widest text-store-bone uppercase">
                            Special
                        </h3>
                        <nav className="mt-3 flex flex-col gap-2 text-sm text-store-bone/70">
                            {SPECIAL_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="hover:text-store-bone"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold tracking-widest text-store-bone uppercase">
                            Account &amp; Shipping Info
                        </h3>
                        <nav className="mt-3 flex flex-col gap-2 text-sm text-store-bone/70">
                            {ACCOUNT_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="hover:text-store-bone"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold tracking-widest text-store-bone uppercase">
                            Newsletter
                        </h3>
                        <p className="mt-3 text-sm text-store-bone/70">
                            Subscribe to our new channel to get latest updates
                        </p>
                        <div className="mt-3">
                            <NewsletterForm />
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-8 border-t border-store-bone/10 pt-8 sm:grid-cols-2">
                    <div>
                        <h3 className="text-xs font-bold tracking-widest text-store-bone uppercase">
                            Start a Conversation
                        </h3>
                        <div className="mt-3 flex flex-col gap-1.5 text-sm text-store-bone/70">
                            <a
                                href="https://wa.me/8801601638822"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-store-bone"
                            >
                                +8801601638822
                            </a>
                            <a
                                href="mailto:info@vintedge.shop"
                                className="hover:text-store-bone"
                            >
                                info@vintedge.shop
                            </a>
                            <a
                                href="mailto:info@vintedge.shop"
                                className="hover:text-store-bone"
                            >
                                Support Ticket
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold tracking-widest text-store-bone uppercase">
                            Address
                        </h3>
                        <p className="mt-3 text-sm text-store-bone/70">
                            Dhaka, Bangladesh
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-store-bone/10 pt-6 text-xs text-store-bone/50 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p>CopyRight {new Date().getFullYear()} Vintedge</p>
                        <p className="mt-1 text-store-bone/40">
                            Developed by Saif Shahriar Hossain
                        </p>
                    </div>
                    <nav className="flex gap-4">
                        <Link
                            href={termsPage()}
                            className="hover:text-store-bone/80"
                        >
                            Terms &amp; Conditions
                        </Link>
                        <Link
                            href={privacyPage()}
                            className="hover:text-store-bone/80"
                        >
                            Privacy Policy
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

export default function StoreLayout({ children }: { children: ReactNode }) {
    return (
        <CartProvider>
            <div className="flex min-h-screen flex-col bg-store-bone text-store-ink">
                <StoreHeader />
                <main className="flex-1">{children}</main>
                <StoreFooter />
                <CartDrawer />
                <WhatsAppFloat />
            </div>
        </CartProvider>
    );
}
