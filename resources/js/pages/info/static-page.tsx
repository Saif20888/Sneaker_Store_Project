import { Head } from '@inertiajs/react';

type StaticPageSection = {
    heading: string;
    body: string;
};

type StaticPageProps = {
    title: string;
    intro?: string;
    sections: StaticPageSection[];
};

export default function StaticPage({
    title,
    intro,
    sections,
}: StaticPageProps) {
    return (
        <>
            <Head title={title} />

            <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
                    {title}
                </h1>

                {intro && (
                    <p className="mt-4 text-sm text-muted-foreground">
                        {intro}
                    </p>
                )}

                <div className="mt-8 flex flex-col gap-8">
                    {sections.map((section) => (
                        <div key={section.heading}>
                            <h2 className="text-sm font-bold tracking-wide uppercase">
                                {section.heading}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {section.body}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
