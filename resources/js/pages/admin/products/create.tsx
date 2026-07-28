import { Head } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import { store } from '@/routes/admin/products';

type CreateProductProps = {
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
};

export default function AdminProductsCreate({
    categories,
    brands,
}: CreateProductProps) {
    return (
        <>
            <Head title="Add Product" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Add Product</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new sneaker listing.
                    </p>
                </div>

                <ProductForm
                    categories={categories}
                    brands={brands}
                    submitUrl={store().url}
                    submitMethod="post"
                    submitLabel="Create Product"
                />
            </div>
        </>
    );
}
