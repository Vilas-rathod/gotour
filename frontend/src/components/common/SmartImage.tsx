import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** Above-the-fold images should be eager + high priority. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Image with a blur-up transition, lazy loading and a graceful broken-image
 * fallback. Catalogue imagery is remote, so a bad URL must never leave a hole
 * in the layout.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  sizes,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-[var(--surface-muted)]', wrapperClassName)}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'size-full object-cover transition-all duration-700',
            loaded ? 'scale-100 blur-0 opacity-100' : 'scale-105 blur-lg opacity-0',
            className,
          )}
        />
      ) : (
        <div className="text-muted grid size-full place-items-center" aria-label={alt} role="img">
          <ImageOff className="size-8 opacity-40" aria-hidden />
        </div>
      )}
    </div>
  );
}
