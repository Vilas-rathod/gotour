import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SmartImage } from './SmartImage';
import { cn } from '@/lib/utils';

export interface GalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Hero mosaic with a full-screen lightbox. One large image plus a 2×2 grid on
 * desktop; a single image with a "view all" affordance on mobile.
 */
export function Gallery({ images, alt, className }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const total = images.length;

  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(
    () => setLightboxIndex((index) => (index === null ? null : (index + 1) % total)),
    [total],
  );
  const previous = useCallback(
    () => setLightboxIndex((index) => (index === null ? null : (index - 1 + total) % total)),
    [total],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, close, next, previous]);

  if (total === 0) return null;

  return (
    <>
      <div className={cn('relative', className)}>
        <div className="grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="group relative sm:col-span-2 sm:row-span-2"
            aria-label={`View ${alt} gallery`}
          >
            <SmartImage
              src={images[0]}
              alt={alt}
              wrapperClassName="aspect-[4/3] sm:h-full sm:aspect-auto"
              className="transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </button>

          {images.slice(1, 5).map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setLightboxIndex(index + 1)}
              className="group relative hidden sm:block"
              aria-label={`View photo ${index + 2} of ${total}`}
            >
              <SmartImage
                src={image}
                alt={`${alt} photo ${index + 2}`}
                wrapperClassName="h-full"
                className="transition-transform duration-700 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        {total > 1 && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="glass-strong absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-glass transition-transform hover:scale-105"
          >
            <Expand className="size-4" aria-hidden />
            View all {total} photos
          </button>
        )}
      </div>

      {/* ------------------------------------------------------ lightbox */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${alt} photo gallery`}
                className="fixed inset-0 z-200 flex items-center justify-center bg-black/95"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close gallery"
                  className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="size-5" />
                </button>

                <span className="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
                  {lightboxIndex + 1} / {total}
                </span>

                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={previous}
                      aria-label="Previous photo"
                      className="absolute left-3 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Next photo"
                      className="absolute right-3 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}

                <motion.img
                  key={lightboxIndex}
                  src={images[lightboxIndex]}
                  alt={`${alt} photo ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[85vh] max-w-[92vw] object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
