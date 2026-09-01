import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useDeleteReviewMutation,
  useMyReviewsQuery,
  useUpdateReviewMutation,
} from '@/features/reviews/reviewsApi';
import { Badge, ReviewStatusBadge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Rating, RatingInput } from '@/components/ui/Rating';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { formatDate, humanizeEnum } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Review, ReviewTargetType } from '@/types/api';

const editSchema = z.object({
  rating: z.number().min(1, 'Pick a rating').max(5),
  title: z.string().max(150).optional(),
  comment: z.string().min(20, 'At least 20 characters').max(2000),
});

type EditValues = z.infer<typeof editSchema>;

const LINK_PREFIX: Record<ReviewTargetType, string> = {
  DESTINATION: '/destinations',
  PACKAGE: '/packages',
  HOTEL: '/hotels',
};

export default function MyReviewsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const { data, isLoading } = useMyReviewsQuery({ page, size: 10 });
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  const openEditor = (review: Review) => {
    setEditing(review);
    reset({
      rating: review.rating,
      title: review.title ?? '',
      comment: review.comment,
    });
  };

  const onSave = async (values: EditValues) => {
    if (!editing) return;
    try {
      await updateReview({
        reviewId: editing.id,
        rating: values.rating,
        title: values.title || undefined,
        comment: values.comment,
      }).unwrap();
      toast.success('Review updated', 'It will be re-checked before publishing.');
      setEditing(null);
    } catch (error) {
      toast.apiError(error, 'Could not update your review');
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget.id).unwrap();
      toast.success('Review deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.apiError(error, 'Could not delete your review');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <>
        <Seo title="My reviews" noIndex />
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="After a trip, share what worked and what you would do differently — it genuinely helps other travellers."
          action={
            <Link to="/account/bookings" className={cn(buttonVariants())}>
              View my trips
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <Seo title="My reviews" noIndex />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl">My reviews</h2>
        <span className="text-muted text-sm">{data.totalElements} written</span>
      </div>

      <ul className="space-y-4">
        {data.content.map((review) => (
          <li key={review.id}>
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {humanizeEnum(review.targetType)}
                      </Badge>
                      <ReviewStatusBadge status={review.status} />
                      {review.verified && (
                        <Badge variant="success" size="sm">
                          Verified stay
                        </Badge>
                      )}
                    </div>

                    <Link
                      to={`${LINK_PREFIX[review.targetType]}/${review.targetSlug}`}
                      className="mt-2 block font-display font-semibold hover:text-brand-ink"
                    >
                      {review.title || review.targetSlug}
                    </Link>

                    <Rating value={review.rating} size="sm" className="mt-1.5" showValue={false} />
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit review"
                      onClick={() => openEditor(review)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete review"
                      className="text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      onClick={() => setDeleteTarget(review)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted mt-3 text-sm leading-relaxed">{review.comment}</p>
                <p className="text-muted mt-3 text-xs">
                  Written {formatDate(review.createdAt)} · {review.helpfulCount} found this helpful
                </p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
        className="mt-8"
      />

      {/* ------------------------------------------------------ edit modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit your review"
        description="Edited reviews go back through moderation before publishing."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button loading={isUpdating} onClick={handleSubmit(onSave)}>
              Save changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
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
          <Input {...register('title')} label="Review title" error={errors.title?.message} />
          <Textarea
            {...register('comment')}
            label="Your review"
            error={errors.comment?.message}
            required
          />
        </form>
      </Modal>

      {/* ---------------------------------------------------- delete modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this review?"
        description="This removes it permanently and cannot be undone."
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Keep it
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={onDelete}>
              Delete review
            </Button>
          </div>
        }
      >
        <p className="text-muted text-sm">
          {deleteTarget?.title || deleteTarget?.targetSlug}
        </p>
      </Modal>
    </>
  );
}
