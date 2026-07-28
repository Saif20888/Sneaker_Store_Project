import { Head } from '@inertiajs/react';
import CategoryForm from '@/components/admin/category-form';
import { update } from '@/routes/admin/categories';

type EditCategoryProps = {
    category: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
    };
};

export default function AdminCategoriesEdit({ category }: EditCategoryProps) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-xl font-bold">Edit Category</h1>
                    <p className="text-sm text-muted-foreground">
                        Update {category.name}.
                    </p>
                </div>

                <CategoryForm
                    submitUrl={update(category.slug).url}
                    submitMethod="patch"
                    submitLabel="Save Changes"
                    initialValues={{
                        name: category.name,
                        slug: category.slug,
                        existingImage: category.image,
                    }}
                />
            </div>
        </>
    );
}
