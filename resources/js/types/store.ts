export type CartItem = {
    variant_id: number;
    product_slug: string;
    product_name: string;
    brand: string;
    size: string;
    unit_price: number;
    quantity: number;
    stock_quantity: number;
    image: string | null;
    line_total: number;
};

export type CartShare = {
    items: CartItem[];
    count: number;
    subtotal: number;
};

export type WishlistShare = {
    ids: number[];
    count: number;
};
