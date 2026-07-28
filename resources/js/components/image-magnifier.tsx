import { useState } from 'react';
import type { MouseEvent } from 'react';

type ImageMagnifierProps = {
    src: string;
    alt: string;
};

export default function ImageMagnifier({ src, alt }: ImageMagnifierProps) {
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState('50% 50%');
    const [loaded, setLoaded] = useState(false);

    const handleMove = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setOrigin(`${x}% ${y}%`);
    };

    return (
        <div
            className="relative aspect-square cursor-zoom-in overflow-hidden bg-store-cream/60"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={handleMove}
        >
            {!loaded && (
                <span className="absolute inset-0 animate-pulse bg-store-gray/50" />
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`size-full object-cover transition-[transform,opacity] duration-200 ease-out ${zoomed ? 'scale-[2]' : 'scale-100'} ${loaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ transformOrigin: origin }}
            />
        </div>
    );
}
