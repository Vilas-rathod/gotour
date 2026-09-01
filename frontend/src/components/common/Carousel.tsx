import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { ReactNode } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string | number;
  /** Slides per view at each breakpoint. */
  perView?: { base: number; sm?: number; md?: number; lg?: number; xl?: number };
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  ariaLabel: string;
}

export function Carousel<T>({
  items,
  renderItem,
  getKey,
  perView = { base: 1.15, sm: 2.2, md: 3, lg: 4 },
  autoplay = false,
  loop = false,
  className,
  ariaLabel,
}: CarouselProps<T>) {
  if (items.length === 0) return null;

  return (
    <Swiper
      className={className}
      modules={[Navigation, Pagination, A11y, Keyboard, ...(autoplay ? [Autoplay] : [])]}
      spaceBetween={20}
      slidesPerView={perView.base}
      navigation
      keyboard={{ enabled: true }}
      a11y={{ containerMessage: ariaLabel }}
      loop={loop && items.length > (perView.lg ?? 4)}
      autoplay={autoplay ? { delay: 4500, disableOnInteraction: true } : false}
      pagination={{ clickable: true, dynamicBullets: true }}
      breakpoints={{
        640: { slidesPerView: perView.sm ?? 2.2 },
        768: { slidesPerView: perView.md ?? 3 },
        1024: { slidesPerView: perView.lg ?? 4 },
        1280: { slidesPerView: perView.xl ?? perView.lg ?? 4 },
      }}
      // Room for the dynamic pagination bullets below the slides.
      style={{ paddingBottom: '2.75rem', paddingInline: '0.25rem' }}
    >
      {items.map((item, index) => (
        <SwiperSlide key={getKey(item, index)} className="h-auto">
          {renderItem(item, index)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
