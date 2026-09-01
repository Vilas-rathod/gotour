import { zodResolver } from '@hookform/resolvers/zod';
import { MapPinned, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useAdminDestinationsQuery,
  useCreateDestinationMutation,
  useDeleteDestinationMutation,
  useUpdateDestinationMutation,
  type SaveDestinationRequest,
} from '@/features/admin/adminCatalogueApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Rating } from '@/components/ui/Rating';
import { Seo } from '@/components/common/Seo';
import { SmartImage } from '@/components/common/SmartImage';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { slugify } from '@/lib/slugify';
import { formatCurrency } from '@/lib/format';
import type { DestinationSummary } from '@/types/api';

const schema = z.object({
  name: z.string().min(2, 'Enter a destination name').max(120),
  slug: z.string().min(2, 'Slug is required').max(140),
  country: z.string().min(2, 'Enter the country').max(80),
  city: z.string().max(80).optional().or(z.literal('')),
  region: z.string().max(80).optional().or(z.literal('')),
  continent: z.string().min(2, 'Enter the continent').max(60),
  shortDescription: z.string().min(10, 'At least 10 characters').max(300),
  description: z.string().min(30, 'At least 30 characters').max(5000),
  heroImageUrl: z.string().url('Enter a valid image URL'),
  thumbnailUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
  bestTimeToVisit: z.string().max(120).optional().or(z.literal('')),
  averageBudget: z.coerce.number().min(0).optional(),
  currency: z.string().length(3, 'Use a 3-letter code'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  tags: z.string().max(300).optional().or(z.literal('')),
  featured: z.boolean(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: '',
  slug: '',
  country: '',
  city: '',
  region: '',
  continent: '',
  shortDescription: '',
  description: '',
  heroImageUrl: '',
  thumbnailUrl: '',
  bestTimeToVisit: '',
  averageBudget: undefined,
  currency: 'INR',
  latitude: undefined,
  longitude: undefined,
  tags: '',
  featured: false,
  active: true,
};

export default function AdminDestinationsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useAdminDestinationsQuery({
    search: debouncedSearch || undefined,
    page,
    size: 12,
  });

  const [createDestination, { isLoading: isCreating }] = useCreateDestinationMutation();
  const [updateDestination, { isLoading: isUpdating }] = useUpdateDestinationMutation();
  const [deleteDestination, { isLoading: isDeleting }] = useDeleteDestinationMutation();

  const [modal, setModal] = useState<{ open: boolean; editing: DestinationSummary | null }>({
    open: false,
    editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<DestinationSummary | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const openCreate = () => {
    reset(EMPTY);
    setModal({ open: true, editing: null });
  };

  const openEdit = (row: DestinationSummary) => {
    // The list DTO carries a subset of columns; the rest keep their defaults
    // until the admin edits them.
    reset({
      ...EMPTY,
      name: row.name,
      slug: row.slug,
      country: row.country,
      city: row.city ?? '',
      continent: row.continent,
      shortDescription: row.shortDescription,
      description: row.shortDescription,
      heroImageUrl: row.heroImageUrl,
      thumbnailUrl: row.thumbnailUrl ?? '',
      averageBudget: row.averageBudget ?? undefined,
      currency: row.currency,
      tags: row.tags.join(', '),
      featured: row.featured,
      active: true,
    });
    setModal({ open: true, editing: row });
  };

  const onSubmit = async (values: FormValues) => {
    const payload: SaveDestinationRequest = {
      name: values.name,
      slug: values.slug,
      country: values.country,
      city: values.city || null,
      region: values.region || null,
      continent: values.continent,
      shortDescription: values.shortDescription,
      description: values.description,
      heroImageUrl: values.heroImageUrl,
      thumbnailUrl: values.thumbnailUrl || null,
      rating: null,
      popularityScore: null,
      bestTimeToVisit: values.bestTimeToVisit || null,
      averageBudget: values.averageBudget ?? null,
      currency: values.currency.toUpperCase(),
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
      tags: values.tags || null,
      featured: values.featured,
      active: values.active,
    };

    try {
      if (modal.editing) {
        await updateDestination({ id: modal.editing.id, body: payload }).unwrap();
        toast.success('Destination updated');
      } else {
        await createDestination(payload).unwrap();
        toast.success('Destination created');
      }
      setModal({ open: false, editing: null });
    } catch (error) {
      toast.apiError(error, 'Could not save the destination');
    }
  };

  const columns: Column<DestinationSummary>[] = [
    {
      key: 'destination',
      header: 'Destination',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SmartImage
            src={row.thumbnailUrl ?? row.heroImageUrl}
            alt={row.name}
            wrapperClassName="size-11 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.name}</p>
            <p className="text-muted truncate font-mono text-xs">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      hideBelow: 'md',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{row.country}</p>
          <p className="text-muted truncate text-xs">{row.continent}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      hideBelow: 'lg',
      render: (row) => <Rating value={row.rating} reviewCount={row.reviewCount} size="sm" />,
    },
    {
      key: 'budget',
      header: 'Avg budget',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-sm tabular-nums">
          {row.averageBudget !== null ? formatCurrency(row.averageBudget, row.currency) : '—'}
        </span>
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      render: (row) =>
        row.featured ? (
          <Badge variant="accent" size="sm">
            Featured
          </Badge>
        ) : (
          <span className="text-muted text-xs">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.name}`}
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.name}`}
            className="text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Seo title="Manage destinations" noIndex />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Destinations</h1>
          <p className="text-muted mt-1 text-sm">
            {data ? `${data.totalElements} destinations` : 'Loading…'}
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
          New destination
        </Button>
      </div>

      <div className="mb-5 max-w-md">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search by name or country"
          leftIcon={<Search className="size-4" />}
          aria-label="Search destinations"
        />
      </div>

      <DataTable
        caption="GoTour destinations"
        columns={columns}
        rows={data?.content ?? []}
        getRowKey={(row) => row.id}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={MapPinned}
            title="No destinations yet"
            description="Add your first destination to start building the catalogue."
            action={<Button onClick={openCreate}>Add destination</Button>}
          />
        }
      />

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          className="mt-8"
        />
      )}

      {/* --------------------------------------------------- editor modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? `Edit ${modal.editing.name}` : 'New destination'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>
              Cancel
            </Button>
            <Button loading={isCreating || isUpdating} onClick={handleSubmit(onSubmit)}>
              Save destination
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input
            {...register('name')}
            label="Name"
            placeholder="Bali"
            error={errors.name?.message}
            required
            onBlur={(event) => {
              if (!watch('slug')) setValue('slug', slugify(event.target.value));
            }}
          />
          <Input
            {...register('slug')}
            label="Slug"
            placeholder="bali"
            hint="Used in the public URL"
            error={errors.slug?.message}
            required
          />
          <Input
            {...register('country')}
            label="Country"
            placeholder="Indonesia"
            error={errors.country?.message}
            required
          />
          <Input {...register('city')} label="City" placeholder="Denpasar" error={errors.city?.message} />
          <Input
            {...register('continent')}
            label="Continent"
            placeholder="Asia"
            error={errors.continent?.message}
            required
          />
          <Input {...register('region')} label="Region" placeholder="South East Asia" error={errors.region?.message} />
          <Textarea
            {...register('shortDescription')}
            label="Short description"
            placeholder="One or two lines shown on cards."
            className="sm:col-span-2"
            error={errors.shortDescription?.message}
            required
          />
          <Textarea
            {...register('description')}
            label="Full description"
            placeholder="The long-form copy on the destination page."
            className="sm:col-span-2"
            error={errors.description?.message}
            required
          />
          <Input
            {...register('heroImageUrl')}
            label="Hero image URL"
            placeholder="https://…"
            error={errors.heroImageUrl?.message}
            required
          />
          <Input
            {...register('thumbnailUrl')}
            label="Thumbnail URL"
            placeholder="https://…"
            error={errors.thumbnailUrl?.message}
          />
          <Input
            {...register('bestTimeToVisit')}
            label="Best time to visit"
            placeholder="April to October"
            error={errors.bestTimeToVisit?.message}
          />
          <Input
            {...register('tags')}
            label="Tags"
            placeholder="beach, culture, surfing"
            hint="Comma separated"
            error={errors.tags?.message}
          />
          <Input
            {...register('averageBudget')}
            type="number"
            label="Average budget"
            error={errors.averageBudget?.message}
          />
          <Input
            {...register('currency')}
            label="Currency"
            placeholder="INR"
            maxLength={3}
            error={errors.currency?.message}
            required
          />
          <Input
            {...register('latitude')}
            type="number"
            step="any"
            label="Latitude"
            error={errors.latitude?.message}
          />
          <Input
            {...register('longitude')}
            type="number"
            step="any"
            label="Longitude"
            error={errors.longitude?.message}
          />

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <Checkbox {...register('featured')} label="Feature on the home page" />
            <Checkbox {...register('active')} label="Visible to customers" />
          </div>
        </form>
      </Modal>

      {/* --------------------------------------------------- delete modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this destination?"
        description="Packages and hotels linked to it will lose their destination reference."
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
                  await deleteDestination(deleteTarget.id).unwrap();
                  toast.success('Destination deleted');
                  setDeleteTarget(null);
                } catch (error) {
                  toast.apiError(error, 'Could not delete the destination');
                }
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-muted text-sm">{deleteTarget?.name}</p>
      </Modal>
    </>
  );
}
