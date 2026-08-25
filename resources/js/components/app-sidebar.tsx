import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    FolderGit2,
    Image,
    LayoutGrid,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as bannersIndex } from '@/routes/admin/banners';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as productsIndex } from '@/routes/admin/products';
import { index as reportsIndex } from '@/routes/admin/reports';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage<{
        pendingOrdersCount?: number;
        pendingReviewsCount?: number;
    }>();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';
    const pendingOrdersCount = page.props.pendingOrdersCount ?? 0;
    const pendingReviewsCount = page.props.pendingReviewsCount ?? 0;

    const mainNavItems: NavItem[] = [
        {
            title: 'Home',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Products',
            href: productsIndex(),
            icon: ShoppingBag,
        },
        {
            title: 'Categories',
            href: categoriesIndex(),
            icon: Tags,
        },
        {
            title: 'Home Banners',
            href: bannersIndex(),
            icon: Image,
        },
        {
            title:
                pendingOrdersCount > 0
                    ? `Orders (${pendingOrdersCount})`
                    : 'Orders',
            href: ordersIndex(),
            icon: ShoppingCart,
        },
        {
            title: 'Reports',
            href: reportsIndex(),
            icon: BarChart3,
        },
        {
            title:
                pendingReviewsCount > 0
                    ? `Reviews (${pendingReviewsCount})`
                    : 'Reviews',
            href: reviewsIndex(),
            icon: Star,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
