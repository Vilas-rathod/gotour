import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bed,
  Bus,
  CalendarDays,
  Camera,
  Check,
  Clock,
  Coffee,
  MapPin,
  MapPinned,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useAddItineraryActivityMutation,
  useAddItineraryDayMutation,
  useDeleteItineraryActivityMutation,
  useDeleteItineraryDayMutation,
  useItineraryQuery,
  useToggleItineraryActivityMutation,
} from '@/features/itineraries/itinerariesApi';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { BackLink } from '@/components/common/BackLink';
import { SmartImage } from '@/components/common/SmartImage';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatDateRange, humanizeEnum } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ActivityCategory } from '@/types/api';

const CATEGORY_ICON: Record<ActivityCategory, typeof Camera> = {
  SIGHTSEEING: Camera,
  FOOD: Coffee,
  TRANSPORT: Bus,
  ACCOMMODATION: Bed,
  ACTIVITY: Sparkles,
  SHOPPING: ShoppingBag,
  FREE_TIME: Clock,
};

const CATEGORIES: ActivityCategory[] = [
  'SIGHTSEEING',
  'FOOD',
  'TRANSPORT',
  'ACCOMMODATION',
  'ACTIVITY',
  'SHOPPING',
  'FREE_TIME',
];

const daySchema = z.object({
  dayNumber: z.coerce.number().int().min(1, 'Day number must be 1 or more'),
  date: z.string().optional().or(z.literal('')),
  title: z.string().min(2, 'Give the day a title').max(140),
  description: z.string().max(500).optional().or(z.literal('')),
});

const activitySchema = z.object({
  startTime: z.string().optional().or(z.literal('')),
  title: z.string().min(2, 'What is happening?').max(140),
  description: z.string().max(500).optional().or(z.literal('')),
  location: z.string().max(160).optional().or(z.literal('')),
  category: z.string().min(1, 'Pick a category'),
});

type DayValues = z.infer<typeof daySchema>;
type ActivityValues = z.infer<typeof activitySchema>;

export default function ItineraryDetailPage() {
  const { id } = useParams();
  const itineraryId = Number(id);
  const toast = useToast();

  const { data: itinerary, isLoading, isError } = useItineraryQuery(itineraryId, {
    skip: !Number.isFinite(itineraryId),
  });

  const [addDay, { isLoading: isAddingDay }] = useAddItineraryDayMutation();
  const [deleteDay] = useDeleteItineraryDayMutation();
  const [addActivity, { isLoading: isAddingActivity }] = useAddItineraryActivityMutation();
  const [toggleActivity] = useToggleItineraryActivityMutation();
  const [deleteActivity] = useDeleteItineraryActivityMutation();

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [activityDayId, setActivityDayId] = useState<number | null>(null);

  const dayForm = useForm<DayValues>({
    resolver: zodResolver(daySchema),
    defaultValues: { dayNumber: 1, date: '', title: '', description: '' },
  });

  const activityForm = useForm<ActivityValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: { startTime: '', title: '', description: '', location: '', category: 'SIGHTSEEING' },
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !itinerary) {
    return (
      <EmptyState
        icon={MapPinned}
        title="Itinerary not found"
        description="This itinerary may have been deleted."
        action={
          <Link to="/account/itineraries" className={cn(buttonVariants())}>
            Back to itineraries
          </Link>
        }
      />
    );
  }

  const openDayModal = () => {
    dayForm.reset({
      dayNumber: itinerary.days.length + 1,
      date: '',
      title: '',
      description: '',
    });
    setDayModalOpen(true);
  };

  const onAddDay = async (values: DayValues) => {
    try {
      await addDay({
        id: itineraryId,
        body: {
          dayNumber: Number(values.dayNumber),
          date: values.date || null,
          title: values.title,
          description: values.description || null,
        },
      }).unwrap();
      toast.success('Day added');
      setDayModalOpen(false);
    } catch (error) {
      toast.apiError(error, 'Could not add the day');
    }
  };

  const onAddActivity = async (values: ActivityValues) => {
    if (activityDayId === null) return;
    try {
      await addActivity({
        id: itineraryId,
        dayId: activityDayId,
        body: {
          startTime: values.startTime || null,
          title: values.title,
          description: values.description || null,
          location: values.location || null,
          category: values.category as ActivityCategory,
        },
      }).unwrap();
      toast.success('Activity added');
      activityForm.reset({
        startTime: '',
        title: '',
        description: '',
        location: '',
        category: 'SIGHTSEEING',
      });
      setActivityDayId(null);
    } catch (error) {
      toast.apiError(error, 'Could not add the activity');
    }
  };

  const totalActivities = itinerary.days.reduce((sum, day) => sum + day.activities.length, 0);
  const doneActivities = itinerary.days.reduce(
    (sum, day) => sum + day.activities.filter((activity) => activity.completed).length,
    0,
  );

  return (
    <>
      <Seo title={itinerary.title} noIndex />

      <BackLink fallbackTo="/account/itineraries" label="All itineraries" className="mb-5" />

      <Card className="overflow-hidden">
        <div className="relative">
          <SmartImage
            src={
              itinerary.coverImageUrl ??
              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=70'
            }
            alt={itinerary.title}
            wrapperClassName="aspect-[21/9]"
            priority
          />
          <div className="card-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{itinerary.title}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" aria-hidden />
                {formatDateRange(itinerary.startDate, itinerary.endDate)}
              </span>
              {itinerary.destinationName && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {itinerary.destinationName}
                </span>
              )}
            </div>
          </div>
        </div>

        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">{itinerary.durationDays} days</Badge>
              <Badge variant="brand">{itinerary.days.length} planned</Badge>
              {totalActivities > 0 && (
                <Badge variant={doneActivities === totalActivities ? 'success' : 'warning'}>
                  {doneActivities}/{totalActivities} done
                </Badge>
              )}
              {itinerary.bookingReference && (
                <Link to={`/account/bookings/${itinerary.bookingReference}`}>
                  <Badge variant="outline">{itinerary.bookingReference}</Badge>
                </Link>
              )}
            </div>

            <Button size="sm" onClick={openDayModal} leftIcon={<Plus className="size-4" />}>
              Add day
            </Button>
          </div>

          {itinerary.notes && (
            <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3.5">
              <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">Notes</p>
              <p className="mt-1 text-sm whitespace-pre-line">{itinerary.notes}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ------------------------------------------------------- timeline */}
      {itinerary.days.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={CalendarDays}
            title="No days planned yet"
            description="Add your first day, then fill it with the things you want to do."
            action={<Button onClick={openDayModal}>Add day one</Button>}
          />
        </div>
      ) : (
        <ol className="mt-6 space-y-5">
          {itinerary.days.map((day) => (
            <li key={day.id}>
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 font-display text-sm font-bold text-white">
                        {day.dayNumber}
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-display text-lg font-semibold">{day.title}</h2>
                        {day.date && <p className="text-muted text-xs">{formatDate(day.date)}</p>}
                        {day.description && (
                          <p className="text-muted mt-1.5 text-sm">{day.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActivityDayId(day.id)}
                        leftIcon={<Plus className="size-4" />}
                      >
                        Activity
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete day ${day.dayNumber}`}
                        className="text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        onClick={async () => {
                          try {
                            await deleteDay({ id: itineraryId, dayId: day.id }).unwrap();
                            toast.success('Day removed');
                          } catch (error) {
                            toast.apiError(error);
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {day.activities.length === 0 ? (
                    <p className="text-muted mt-4 rounded-xl border border-dashed p-3.5 text-sm">
                      Nothing planned for this day yet.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-2.5">
                      {day.activities.map((activity) => {
                        const Icon = CATEGORY_ICON[activity.category] ?? Sparkles;

                        return (
                          <li
                            key={activity.id}
                            className={cn(
                              'flex items-start gap-3 rounded-xl border p-3 transition-colors',
                              activity.completed && 'bg-[var(--surface-muted)] opacity-70',
                            )}
                          >
                            <button
                              type="button"
                              aria-label={
                                activity.completed ? 'Mark as not done' : 'Mark as done'
                              }
                              aria-pressed={activity.completed}
                              onClick={() =>
                                toggleActivity({
                                  id: itineraryId,
                                  dayId: day.id,
                                  activityId: activity.id,
                                })
                              }
                              className={cn(
                                'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
                                activity.completed
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'hover:border-brand-500',
                              )}
                            >
                              {activity.completed && <Check className="size-3" aria-hidden />}
                            </button>

                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                              <Icon className="size-4" aria-hidden />
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {activity.startTime && (
                                  <span className="text-muted font-mono text-xs">
                                    {activity.startTime.slice(0, 5)}
                                  </span>
                                )}
                                <span
                                  className={cn(
                                    'text-sm font-semibold',
                                    activity.completed && 'line-through',
                                  )}
                                >
                                  {activity.title}
                                </span>
                                <Badge variant="neutral" size="sm">
                                  {humanizeEnum(activity.category)}
                                </Badge>
                              </div>

                              {activity.description && (
                                <p className="text-muted mt-1 text-sm">{activity.description}</p>
                              )}
                              {activity.location && (
                                <p className="text-muted mt-1 inline-flex items-center gap-1.5 text-xs">
                                  <MapPin className="size-3" aria-hidden />
                                  {activity.location}
                                </p>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${activity.title}`}
                              className="text-muted shrink-0 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              onClick={async () => {
                                try {
                                  await deleteActivity({
                                    id: itineraryId,
                                    dayId: day.id,
                                    activityId: activity.id,
                                  }).unwrap();
                                } catch (error) {
                                  toast.apiError(error);
                                }
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {/* ---------------------------------------------------------- modals */}
      <Modal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title="Add a day"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDayModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={isAddingDay} onClick={dayForm.handleSubmit(onAddDay)}>
              Add day
            </Button>
          </div>
        }
      >
        <form onSubmit={dayForm.handleSubmit(onAddDay)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input
            {...dayForm.register('dayNumber')}
            type="number"
            min={1}
            label="Day number"
            error={dayForm.formState.errors.dayNumber?.message}
            required
          />
          <Input
            {...dayForm.register('date')}
            type="date"
            label="Date"
            error={dayForm.formState.errors.date?.message}
          />
          <Input
            {...dayForm.register('title')}
            label="Day title"
            placeholder="Arrival & old town walk"
            className="sm:col-span-2"
            error={dayForm.formState.errors.title?.message}
            required
          />
          <Textarea
            {...dayForm.register('description')}
            label="Description"
            className="sm:col-span-2"
            error={dayForm.formState.errors.description?.message}
          />
        </form>
      </Modal>

      <Modal
        open={activityDayId !== null}
        onClose={() => setActivityDayId(null)}
        title="Add an activity"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setActivityDayId(null)}>
              Cancel
            </Button>
            <Button loading={isAddingActivity} onClick={activityForm.handleSubmit(onAddActivity)}>
              Add activity
            </Button>
          </div>
        }
      >
        <form
          onSubmit={activityForm.handleSubmit(onAddActivity)}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <Input
            {...activityForm.register('startTime')}
            type="time"
            label="Start time"
            error={activityForm.formState.errors.startTime?.message}
          />
          <Select
            {...activityForm.register('category')}
            label="Category"
            error={activityForm.formState.errors.category?.message}
            required
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {humanizeEnum(category)}
              </option>
            ))}
          </Select>
          <Input
            {...activityForm.register('title')}
            label="What are you doing?"
            placeholder="Sunrise at Angkor Wat"
            className="sm:col-span-2"
            error={activityForm.formState.errors.title?.message}
            required
          />
          <Input
            {...activityForm.register('location')}
            label="Location"
            placeholder="Siem Reap"
            className="sm:col-span-2"
            error={activityForm.formState.errors.location?.message}
          />
          <Textarea
            {...activityForm.register('description')}
            label="Notes"
            className="sm:col-span-2"
            error={activityForm.formState.errors.description?.message}
          />
        </form>
      </Modal>
    </>
  );
}
