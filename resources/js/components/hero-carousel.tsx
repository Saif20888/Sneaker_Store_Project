import { useEffect, useState } from 'react';

const DEFAULT_SLIDES = [
    '/images/banners/banner-1.webp',
    '/images/banners/banner-4.webp',
    '/images/banners/banner-2.webp',
    '/images/banners/banner-3.webp',
];

type HeroCarouselProps = {
    slides?: string[];
};

export default function HeroCarousel({ slides }: HeroCarouselProps) {
    const [active, setActive] = useState(0);
    const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

    useEffect(() => {
        const interval = setInterval(() => {
            setActive((current) => (current + 1) % activeSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeSlides.length]);

    return (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-store-ink sm:aspect-[16/9]">
            {activeSlides.map((src, index) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    className={`absolute inset-0 size-full object-contain transition-opacity duration-1000 ease-in-out ${
                        index === active ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 sm:bottom-6">
                {activeSlides.map((src, index) => (
                    <button
                        key={src}
                        type="button"
                        onClick={() => setActive(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === active
                                ? 'w-6 bg-store-bone'
                                : 'w-1.5 bg-store-bone/40 hover:bg-store-bone/70'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
