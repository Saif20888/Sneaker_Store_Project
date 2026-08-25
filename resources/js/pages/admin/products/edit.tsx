import { Head } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import { update } from '@/routes/admin/products';

type EditableProduct = {
    id: number;
    slug: string;
    name: string;
    category_id: number;
    brand_id: number;
    description: string | null;
    original_price: number;
    purchase_price: number | null;
    discount_price: number | null;
    discount_percentage: number | null;
    is_featured: boolean;
    release_date: string | null;
    images: string[];
    variants: { id: number; size: string; stock_quantity: number }[];
};

type EditProductProps = {
    product: EditableProduct;
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
};

export default function AdminProductsEdit({
    product,
    categories,
    brands,
}: EditProductProps) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Edit Product</h1>
                    <p className="text-sm text-muted-foreground">
                        {product.name}
                    </p>
                </div>

                <ProductForm
                    categories={categories}
                    brands={brands}
                    submitUrl={update(product.slug).url}
                    submitMethod="patch"
                    submitLabel="Save Changes"
                    initialValues={{
                        name: product.name,
                        slug: product.slug,
                        category_id: String(product.category_id),
                        brand_id: String(product.brand_id),
                        description: product.description ?? '',
                        original_price: String(product.original_price),
                        purchase_price: product.purchase_price
                            ? String(product.purchase_price)
                            : '',
                        discount_price: product.discount_price
                            ? String(product.discount_price)
                            : '',
                        discount_percentage: product.discount_percentage
                            ? String(product.discount_percentage)
                            : '',
                        is_featured: product.is_featured,
                        release_date: product.release_date ?? '',
                        existing_images: product.images,
                        variants:
                            product.variants.length > 0
                                ? product.variants
                                : [{ size: '', stock_quantity: 0 }],
                    }}
                />
            </div>
        </>
    );
}
