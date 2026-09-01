import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateReviewMutation,
  useMarkReviewHelpfulMutation,
  useReviewSummaryQuery,
  useReviewsQuery,
} from '@/features/reviews/reviewsApi';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Rating, RatingInput } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatRelative, initialsOf } from '@/lib/format';
import type { ReviewTargetType } from '@/types/api';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Pick a rating').max(5),
  title: z.string().max(150, 'Keep the title under 150 characters').optional(),
  comment: z
    .string()
    .min(20, 'Tell us a little more — at least 20 characters')
    .max(2000, 'Keep your review under 2000 characters'),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export interface ReviewSectionProps {
  targetType: ReviewTargetType;
  targetSlug: string;
  targetTitle: string;
}

/** Rating distribution bars (5★ → 1★). */
function DistributionBars({
  distribution,
  total,
}: {
  distribution: Record<string, number>;
  total: number;
}) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[String(star)] ?? 0;
        const percent = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2.5 text-xs">
            <span className="text-muted w-6 shrink-0 text-right">{star}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="h-full rounded-full bg-[var(--star)] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-muted w-8 shrink-0">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewSection({ targetType, targetSlug, targetTitle }: ReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [writeOpen, setWriteOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useReviewSummaryQuery({
    targetType,
    targetSlug,
  });
  const { data: reviews, isLoading } = useReviewsQuery({
    targetType,
    targetSlug,
    page,
    size: 5,
  });

  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  const [markHelpful] = useMarkReviewHelpfulMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', comment: '' },
  });

  const onSubmit = async (values: ReviewValues) => {
    try {
      await createReview({
        targetType,
        targetSlug,
        rating: values.rating,
        title: values.title || undefined,
        comment: values.comment,
      }).unwrap();

      toast.success('Thanks for your review', 'It will appear once our team approves it.');
      reset();
      setWriteOpen(false);
    } catch (error) {
      toast.apiError(error, 'Could not submit your review');
    }
  };

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl">Traveller reviews</h2>
        <Button
          variant="secondary"
          onClick={() => {
            if (!isAuthenticated) {
              toast.info('Sign in to write a review');
              return;
            }
            setWriteOpen(true);
          }}
          leftIcon={<MessageSquare className="size-4" />}
        >
          Write a review
        </Button>
      </div>

      {/* ------------------------------------------------------- summary */}
      {summaryLoading ? (
        <Skeleton className="h-36 w-full rounded-2xl" />
      ) : summary && summary.totalReviews > 0 ? (
        <Card className="mb-6">
          <CardBody className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:border-r sm:pr-8">
              <p className="font-display text-4xl font-bold">{summary.averageRating.toFixed(1)}</p>
              <Rating value={summary.averageRating} showValue={false} className="mt-1.5 justify-center" />
              <p className="text-muted mt-1.5 text-xs">
                {summary.totalReviews} verified {summary.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <DistributionBars distribution={summary.distribution} total={summary.totalReviews} />
          </CardBody>
        </Card>
      ) : null}

      {/* -------------------------------------------------------- list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : reviews && reviews.content.length > 0 ? (
        <>
          <ul className="space-y-4">
            {reviews.content.map((review) => (
              <li key={review.id}>
                <Card>
                  <CardBody>
                    <div className="flex items-start gap-3.5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {initialsOf(review.userName)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="success" size="sm">
                              Verified stay
                            </Badge>
                          )}
                          <span className="text-muted text-xs">{formatRelative(review.createdAt)}</span>
                        </div>

                        <Rating value={review.rating} size="sm" className="mt-1.5" showValue={false} />

                        {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
                        <p className="text-muted mt-1.5 text-sm leading-relaxed">{review.comment}</p>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!isAuthenticated) {
                              toast.info('Sign in to mark reviews helpful');
                              return;
                            }
                            try {
                              await markHelpful({ reviewId: review.id, targetSlug }).unwrap();
                            } catch (error) {
                              toast.apiError(error, 'Could not record that');
                            }
                          }}
                          className="text-muted mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand-400 hover:text-brand-ink"
                        >
                          <ThumbsUp className="size-3.5" aria-hidden />
                          Helpful ({review.helpfulCount})
                        </button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination
            page={reviews.page}
            totalPages={reviews.totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description={`Be the first to share your experience of ${targetTitle}.`}
        />
      )}

      {/* ------------------------------------------------- write review */}
      <Modal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        title={`Review ${targetTitle}`}
        description="Reviews are published after a quick moderation check."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setWriteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              Submit review
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                label="Your rating"
                error={errors.rating?.message}
              />
            )}
          />

          <Input
            {...register('title')}
            label="Review title"
            placeholder="Sum it up in a few words"
            error={errors.title?.message}
          />

          <Textarea
            {...register('comment')}
            label="Your review"
            placeholder="What stood out? What would you tell a friend planning the same trip?"
            error={errors.comment?.message}
            required
          />
        </form>
      </Modal>
    </section>
  );
}
