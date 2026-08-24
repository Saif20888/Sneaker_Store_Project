import { usePage } from '@inertiajs/react';

const WHATSAPP_NUMBER = '8801601638822';

export default function WhatsAppFloat() {
    const { url } = usePage();

    // Product pages already have their own inline "Order via WhatsApp" button
    // right next to the size/add-to-bag controls, so the floating button here
    // would just overlap it on short mobile viewports.
    if (url.startsWith('/sneakers/')) {
        return null;
    }

    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="fixed right-4 bottom-20 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
        >
            <svg
                viewBox="0 0 32 32"
                className="size-7"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d="M16.004 0C7.163 0 0 7.163 0 16.004c0 2.822.738 5.556 2.14 7.968L0 32l8.223-2.104a15.9 15.9 0 0 0 7.78 2.014h.001c8.84 0 16.004-7.163 16.004-16.004C32.008 7.163 24.844 0 16.004 0Zm0 29.286a13.24 13.24 0 0 1-6.75-1.849l-.484-.287-4.879 1.248 1.303-4.756-.315-.488a13.234 13.234 0 0 1-2.03-7.15c0-7.316 5.953-13.268 13.27-13.268 3.545 0 6.877 1.382 9.383 3.891a13.174 13.174 0 0 1 3.883 9.384c0 7.317-5.953 13.275-13.281 13.275Zm7.288-9.94c-.399-.2-2.365-1.167-2.732-1.301-.366-.134-.633-.2-.9.2-.266.4-1.032 1.301-1.266 1.567-.233.267-.466.3-.865.1-.399-.2-1.685-.62-3.208-1.977-1.186-1.057-1.987-2.363-2.22-2.763-.233-.4-.025-.616.175-.816.18-.179.399-.466.599-.7.2-.233.266-.4.4-.666.133-.267.066-.5-.034-.7-.1-.2-.9-2.166-1.233-2.966-.324-.78-.653-.675-.9-.687l-.767-.014a1.47 1.47 0 0 0-1.066.5c-.366.4-1.399 1.367-1.399 3.332s1.432 3.865 1.632 4.132c.2.267 2.82 4.306 6.833 6.037.955.412 1.7.658 2.28.842.958.305 1.83.262 2.52.159.769-.115 2.365-.967 2.698-1.9.333-.933.333-1.733.233-1.9-.1-.166-.366-.266-.766-.466Z" />
            </svg>
        </a>
    );
}
