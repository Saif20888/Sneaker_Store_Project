import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export type HeroSlide = { image: string; link: string | null };

const DEFAULT_SLIDES: HeroSlide[] = [
    { image: '/images/banners/banner-1.webp', link: null },
    { image: '/images/banners/banner-4.webp', link: null },
    { image: '/images/banners/banner-2.webp', link: null },
    { image: '/images/banners/banner-3.webp', link: null },
];

type HeroCarouselProps = {
    slides?: HeroSlide[];
};

export default function HeroCarousel({ slides }: HeroCarouselProps) {
    const [active, setActive] = useState(0);
    const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
    const activeLink = activeSlides[active]?.link;

    useEffect(() => {
        const interval = setInterval(() => {
            setActive((current) => (current + 1) % activeSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeSlides.length]);

    const goToPrevious = () => {
        setActive(
            (current) =>
                (current - 1 + activeSlides.length) % activeSlides.length,
        );
    };

    const goToNext = () => {
        setActive((current) => (current + 1) % activeSlides.length);
    };

    return (
        <div className="group relative aspect-[4/3] w-full overflow-hidden bg-store-ink sm:aspect-[16/9]">
            {activeSlides.map((slide, index) => (
                <img
                    key={slide.image}
                    src={slide.image}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    className={`absolute inset-0 size-full object-contain transition-opacity duration-1000 ease-in-out ${
                        index === active ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            {activeLink && (
                <a
                    href={activeLink}
                    aria-label="View this offer"
                    className="absolute inset-0"
                />
            )}

            {activeSlides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goToPrevious}
                        aria-label="Previous slide"
                        className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-store-ink/50 text-store-bone opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-store-ink/70 sm:left-4"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Next slide"
                        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-store-ink/50 text-store-bone opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-store-ink/70 sm:right-4"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </>
            )}

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 sm:bottom-6">
                {activeSlides.map((slide, index) => (
                    <button
                        key={slide.image}
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
