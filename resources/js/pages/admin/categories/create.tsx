import { Head } from '@inertiajs/react';
import CategoryForm from '@/components/admin/category-form';
import { store } from '@/routes/admin/categories';

export default function AdminCategoriesCreate() {
    return (
        <>
            <Head title="Add Category" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Add Category</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new product category.
                    </p>
                </div>

                <CategoryForm
                    submitUrl={store().url}
                    submitMethod="post"
                    submitLabel="Create Category"
                />
            </div>
        </>
    );
}
