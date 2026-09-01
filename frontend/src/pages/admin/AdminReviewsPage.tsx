import { Check, MessageSquare, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAdminDeleteReviewMutation,
  useAdminReviewStatsQuery,
  useAdminReviewsQuery,
  useModerateReviewMutation,
} from '@/features/reviews/reviewsApi';
import { StatTile } from '@/components/admin/StatTile';
import { Badge, ReviewStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Rating } from '@/components/ui/Rating';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate, humanizeEnum, initialsOf } from '@/lib/format';
import type { Review, ReviewStatus, ReviewTargetType } from '@/types/api';
import { CircleCheck, CircleSlash, Clock } from 'lucide-react';

const STATUSES: ReviewStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
const TARGETS: ReviewTargetType[] = ['DESTINATION', 'PACKAGE', 'HOTEL'];

const LINK_PREFIX: Record<ReviewTargetType, string> = {
  DESTINATION: '/destinations',
  PACKAGE: '/packages',
  HOTEL: '/hotels',
};

export default function AdminReviewsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReviewStatus | ''>('PENDING');
  const [targetType, setTargetType] = useState<ReviewTargetType | ''>('');
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: stats, isLoading: statsLoading } = useAdminReviewStatsQuery();
  const { data, isLoading } = useAdminReviewsQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
    targetType: targetType || undefined,
    page,
    size: 10,
  });

  const [moderate] = useModerateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useAdminDeleteReviewMutation();
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const handleModerate = async (review: Review, next: ReviewStatus) => {
    try {
      await moderate({ reviewId: review.id, status: next }).unwrap();
      toast.success(next === 'APPROVED' ? 'Review published' : 'Review rejected');
    } catch (error) {
      toast.apiError(error, 'Could not moderate this review');
    }
  };

  return (
    <>
      <Seo title="Review moderation" noIndex />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl">Review moderation</h1>
        <p className="text-muted mt-1 text-sm">
          Approve or reject traveller reviews before they appear on the site.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Clock}
          label="Pending"
          value={String(stats?.pending ?? 0)}
          loading={statsLoading}
          tone={stats && stats.pending > 0 ? 'warning' : 'brand'}
        />
        <StatTile
          icon={CircleCheck}
          label="Approved"
          value={String(stats?.approved ?? 0)}
          loading={statsLoading}
          tone="success"
        />
        <StatTile
          icon={CircleSlash}
          label="Rejected"
          value={String(stats?.rejected ?? 0)}
          loading={statsLoading}
          tone="danger"
        />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Reviewer, title or comment"
          leftIcon={<Search className="size-4" />}
          aria-label="Search reviews"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ReviewStatus | '');
            setPage(0);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
        <Select
          value={targetType}
          onChange={(event) => {
            setTargetType(event.target.value as ReviewTargetType | '');
            setPage(0);
          }}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {TARGETS.map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nothing to moderate"
          description="No reviews match these filters."
        />
      ) : (
        <>
          <ul className="space-y-4">
            {data.content.map((review) => (
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
                          <ReviewStatusBadge status={review.status} />
                          {review.verified && (
                            <Badge variant="success" size="sm">
                              Verified stay
                            </Badge>
                          )}
                          <span className="text-muted text-xs">{formatDate(review.createdAt)}</span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Rating value={review.rating} size="sm" showValue={false} />
                          <Link
                            to={`${LINK_PREFIX[review.targetType]}/${review.targetSlug}`}
                            className="text-muted text-xs hover:text-brand-ink"
                          >
                            {humanizeEnum(review.targetType)} · {review.targetSlug}
                          </Link>
                        </div>

                        {review.title && <p className="mt-2.5 font-semibold">{review.title}</p>}
                        <p className="text-muted mt-1.5 text-sm leading-relaxed">{review.comment}</p>

                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {review.status !== 'APPROVED' && (
                            <Button
                              size="sm"
                              onClick={() => handleModerate(review, 'APPROVED')}
                              leftIcon={<Check className="size-4" />}
                            >
                              Approve
                            </Button>
                          )}
                          {review.status !== 'REJECTED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleModerate(review, 'REJECTED')}
                              leftIcon={<X className="size-4" />}
                            >
                              Reject
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            onClick={() => setDeleteTarget(review)}
                            leftIcon={<Trash2 className="size-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
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
        </>
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this review?"
        description="This removes it permanently. Prefer rejecting if you may want it back."
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={async () => {
                if (!deleteTarget) return;
                try {
                  await deleteReview(deleteTarget.id).unwrap();
                  toast.success('Review deleted');
                  setDeleteTarget(null);
                } catch (error) {
                  toast.apiError(error);
                }
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-muted text-sm">
          {deleteTarget?.title || deleteTarget?.comment.slice(0, 120)}
        </p>
      </Modal>
    </>
  );
}
