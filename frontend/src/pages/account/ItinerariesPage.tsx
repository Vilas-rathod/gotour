import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, MapPinned, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateItineraryMutation,
  useDeleteItineraryMutation,
  useItinerariesQuery,
} from '@/features/itineraries/itinerariesApi';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { useToast } from '@/hooks/useToast';
import { formatDateRange, pluralize } from '@/lib/format';

const itinerarySchema = z
  .object({
    title: z.string().min(3, 'Give your trip a name').max(140),
    destinationName: z.string().max(120).optional().or(z.literal('')),
    coverImageUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
    notes: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

type ItineraryValues = z.infer<typeof itinerarySchema>;

export default function ItinerariesPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useItinerariesQuery({ page, size: 9 });
  const [createItinerary, { isLoading: isCreating }] = useCreateItineraryMutation();
  const [deleteItinerary, { isLoading: isDeleting }] = useDeleteItineraryMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItineraryValues>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      title: '',
      destinationName: '',
      coverImageUrl: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
  });

  const onCreate = async (values: ItineraryValues) => {
    try {
      await createItinerary({
        title: values.title,
        destinationName: values.destinationName || null,
        coverImageUrl: values.coverImageUrl || null,
        startDate: values.startDate,
        endDate: values.endDate,
        notes: values.notes || null,
      }).unwrap();
      toast.success('Itinerary created', 'Now add your days and activities.');
      reset();
      setCreateOpen(false);
    } catch (error) {
      toast.apiError(error, 'Could not create the itinerary');
    }
  };

  const onDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteItinerary(deleteId).unwrap();
      toast.success('Itinerary deleted');
      setDeleteId(null);
    } catch (error) {
      toast.apiError(error, 'Could not delete the itinerary');
    }
  };

  const createModal = (
    <Modal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      title="New itinerary"
      description="Plan your days, then add activities to each one."
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button loading={isCreating} onClick={handleSubmit(onCreate)}>
            Create itinerary
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onCreate)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input
          {...register('title')}
          label="Trip name"
          placeholder="Kerala backwaters, March"
          className="sm:col-span-2"
          error={errors.title?.message}
          required
        />
        <Input
          {...register('destinationName')}
          label="Destination"
          placeholder="Alleppey, India"
          error={errors.destinationName?.message}
        />
        <Input
          {...register('coverImageUrl')}
          label="Cover image URL"
          placeholder="https://…"
          error={errors.coverImageUrl?.message}
        />
        <Input
          {...register('startDate')}
          type="date"
          label="Start date"
          error={errors.startDate?.message}
          required
        />
        <Input
          {...register('endDate')}
          type="date"
          label="End date"
          error={errors.endDate?.message}
          required
        />
        <Textarea
          {...register('notes')}
          label="Notes"
          placeholder="Flight numbers, packing reminders, anything else."
          className="sm:col-span-2"
          error={errors.notes?.message}
        />
      </form>
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Seo title="My itineraries" noIndex />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">My itineraries</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)} leftIcon={<Plus className="size-4" />}>
          New itinerary
        </Button>
      </div>

      {!data || data.content.length === 0 ? (
        <>
          <EmptyState
            icon={MapPinned}
            title="No itineraries yet"
            description="Build a day-by-day plan for any trip — booked with GoTour or not."
            action={<Button onClick={() => setCreateOpen(true)}>Create your first itinerary</Button>}
          />
          {createModal}
        </>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map((itinerary) => (
              <li key={itinerary.id}>
                <Card className="group h-full overflow-hidden">
                  <Link to={`/account/itineraries/${itinerary.id}`} className="block">
                    <div className="relative">
                      <SmartImage
                        src={
                          itinerary.coverImageUrl ??
                          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=70'
                        }
                        alt={itinerary.title}
                        wrapperClassName="aspect-[16/10]"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="card-scrim absolute inset-0" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="line-clamp-2-safe font-display text-lg font-semibold text-white">
                          {itinerary.title}
                        </h3>
                        {itinerary.destinationName && (
                          <p className="mt-0.5 text-xs text-white/80">{itinerary.destinationName}</p>
                        )}
                      </div>
                    </div>
                  </Link>

                  <CardBody className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-muted flex items-center gap-1.5 text-xs">
                        <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                        {formatDateRange(itinerary.startDate, itinerary.endDate)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="neutral" size="sm">
                          {pluralize(itinerary.durationDays, 'day')}
                        </Badge>
                        <Badge variant="brand" size="sm">
                          {pluralize(itinerary.dayCount, 'day planned')}
                        </Badge>
                      </div>
                      {itinerary.bookingReference && (
                        <p className="text-muted mt-2 font-mono text-[11px]">
                          {itinerary.bookingReference}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${itinerary.title}`}
                      className="text-muted shrink-0 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      onClick={() => setDeleteId(itinerary.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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

          {createModal}

          <Modal
            open={deleteId !== null}
            onClose={() => setDeleteId(null)}
            title="Delete this itinerary?"
            description="All days and activities inside it will be removed."
            size="sm"
            footer={
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeleteId(null)}>
                  Keep it
                </Button>
                <Button variant="danger" loading={isDeleting} onClick={onDelete}>
                  Delete
                </Button>
              </div>
            }
          >
            <p className="text-muted text-sm">This cannot be undone.</p>
          </Modal>
        </>
      )}
    </>
  );
}
