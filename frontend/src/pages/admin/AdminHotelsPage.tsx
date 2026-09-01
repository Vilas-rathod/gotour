import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useAdminHotelsQuery,
  useCreateHotelMutation,
  useDeleteHotelMutation,
  useUpdateHotelMutation,
  type SaveHotelRequest,
} from '@/features/admin/adminCatalogueApi';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
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
import type { HotelSummary } from '@/types/api';

const schema = z.object({
  name: z.string().min(3, 'Enter the hotel name').max(160),
  slug: z.string().min(3, 'Slug is required').max(180),
  destinationSlug: z.string().min(2, 'Enter the destination slug').max(140),
  destinationName: z.string().min(2, 'Enter the destination name').max(120),
  city: z.string().min(2, 'Enter the city').max(80),
  country: z.string().min(2, 'Enter the country').max(80),
  address: z.string().min(5, 'Enter the street address').max(240),
  shortDescription: z.string().min(10, 'At least 10 characters').max(400),
  description: z.string().min(30, 'At least 30 characters').max(6000),
  starRating: z.coerce.number().int().min(1).max(5),
  pricePerNight: z.coerce.number().min(1, 'Enter a nightly rate'),
  currency: z.string().length(3, 'Use a 3-letter code'),
  heroImageUrl: z.string().url('Enter a valid image URL'),
  amenities: z.string().max(500).optional().or(z.literal('')),
  checkInTime: z.string().max(10).optional().or(z.literal('')),
  checkOutTime: z.string().max(10).optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  featured: z.boolean(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: '',
  slug: '',
  destinationSlug: '',
  destinationName: '',
  city: '',
  country: '',
  address: '',
  shortDescription: '',
  description: '',
  starRating: 4,
  pricePerNight: 0,
  currency: 'INR',
  heroImageUrl: '',
  amenities: '',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  latitude: undefined,
  longitude: undefined,
  featured: false,
  active: true,
};

export default function AdminHotelsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useAdminHotelsQuery({
    search: debouncedSearch || undefined,
    page,
    size: 12,
  });

  const [createHotel, { isLoading: isCreating }] = useCreateHotelMutation();
  const [updateHotel, { isLoading: isUpdating }] = useUpdateHotelMutation();
  const [deleteHotel, { isLoading: isDeleting }] = useDeleteHotelMutation();

  const [modal, setModal] = useState<{ open: boolean; editing: HotelSummary | null }>({
    open: false,
    editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<HotelSummary | null>(null);

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

  const openEdit = (row: HotelSummary) => {
    reset({
      ...EMPTY,
      name: row.name,
      slug: row.slug,
      destinationSlug: row.destinationSlug,
      destinationName: row.destinationName,
      city: row.city,
      country: row.country,
      address: row.city,
      shortDescription: row.shortDescription,
      description: row.shortDescription,
      starRating: row.starRating,
      pricePerNight: row.pricePerNight,
      currency: row.currency,
      heroImageUrl: row.heroImageUrl,
      amenities: row.amenities.join(', '),
      featured: row.featured,
      active: true,
    });
    setModal({ open: true, editing: row });
  };

  const onSubmit = async (values: FormValues) => {
    const payload: SaveHotelRequest = {
      name: values.name,
      slug: values.slug,
      destinationSlug: values.destinationSlug,
      destinationName: values.destinationName,
      city: values.city,
      country: values.country,
      address: values.address,
      shortDescription: values.shortDescription,
      description: values.description,
      starRating: values.starRating,
      pricePerNight: values.pricePerNight,
      currency: values.currency.toUpperCase(),
      heroImageUrl: values.heroImageUrl,
      amenities: values.amenities || null,
      checkInTime: values.checkInTime || null,
      checkOutTime: values.checkOutTime || null,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
      featured: values.featured,
      active: values.active,
    };

    try {
      if (modal.editing) {
        await updateHotel({ id: modal.editing.id, body: payload }).unwrap();
        toast.success('Hotel updated');
      } else {
        await createHotel(payload).unwrap();
        toast.success('Hotel created');
      }
      setModal({ open: false, editing: null });
    } catch (error) {
      toast.apiError(error, 'Could not save the hotel');
    }
  };

  const columns: Column<HotelSummary>[] = [
    {
      key: 'hotel',
      header: 'Hotel',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SmartImage
            src={row.heroImageUrl}
            alt={row.name}
            wrapperClassName="size-11 shrink-0 rounded-lg"
          />
          <div className="min-w-0 max-w-56">
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
          <p className="truncate text-sm">{row.city}</p>
          <p className="text-muted truncate text-xs">{row.country}</p>
        </div>
      ),
    },
    {
      key: 'stars',
      header: 'Class',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-sm text-[var(--star)]" aria-label={`${row.starRating} star`}>
          {'★'.repeat(row.starRating)}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Per night',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(row.pricePerNight, row.currency)}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      hideBelow: 'lg',
      render: (row) => <Rating value={row.rating} reviewCount={row.reviewCount} size="sm" />,
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
      <Seo title="Manage hotels" noIndex />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Hotels</h1>
          <p className="text-muted mt-1 text-sm">
            {data ? `${data.totalElements} properties` : 'Loading…'}
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
          New hotel
        </Button>
      </div>

      <div className="mb-5 max-w-md">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search by name or city"
          leftIcon={<Search className="size-4" />}
          aria-label="Search hotels"
        />
      </div>

      <DataTable
        caption="GoTour hotels"
        columns={columns}
        rows={data?.content ?? []}
        getRowKey={(row) => row.id}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={Building2}
            title="No hotels yet"
            description="Add your first property to start taking room bookings."
            action={<Button onClick={openCreate}>Add hotel</Button>}
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

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? `Edit ${modal.editing.name}` : 'New hotel'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>
              Cancel
            </Button>
            <Button loading={isCreating || isUpdating} onClick={handleSubmit(onSubmit)}>
              Save hotel
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input
            {...register('name')}
            label="Hotel name"
            placeholder="The Oberoi Beach Resort"
            className="sm:col-span-2"
            error={errors.name?.message}
            required
            onBlur={(event) => {
              if (!watch('slug')) setValue('slug', slugify(event.target.value));
            }}
          />
          <Input
            {...register('slug')}
            label="Slug"
            placeholder="oberoi-beach-resort"
            error={errors.slug?.message}
            required
          />
          <Input
            {...register('destinationSlug')}
            label="Destination slug"
            placeholder="bali"
            error={errors.destinationSlug?.message}
            required
          />
          <Input
            {...register('destinationName')}
            label="Destination name"
            placeholder="Bali"
            error={errors.destinationName?.message}
            required
          />
          <Input
            {...register('city')}
            label="City"
            placeholder="Seminyak"
            error={errors.city?.message}
            required
          />
          <Input
            {...register('country')}
            label="Country"
            placeholder="Indonesia"
            error={errors.country?.message}
            required
          />
          <Input
            {...register('address')}
            label="Street address"
            className="sm:col-span-2"
            error={errors.address?.message}
            required
          />
          <Textarea
            {...register('shortDescription')}
            label="Short description"
            className="sm:col-span-2"
            error={errors.shortDescription?.message}
            required
          />
          <Textarea
            {...register('description')}
            label="Full description"
            className="sm:col-span-2"
            error={errors.description?.message}
            required
          />
          <Select
            {...register('starRating')}
            label="Star rating"
            error={errors.starRating?.message}
            required
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star
              </option>
            ))}
          </Select>
          <Input
            {...register('pricePerNight')}
            type="number"
            label="Price per night"
            error={errors.pricePerNight?.message}
            required
          />
          <Input
            {...register('currency')}
            label="Currency"
            maxLength={3}
            error={errors.currency?.message}
            required
          />
          <Input
            {...register('amenities')}
            label="Amenities"
            placeholder="Pool, Spa, Free WiFi, Beachfront"
            hint="Comma separated"
            error={errors.amenities?.message}
          />
          <Input
            {...register('checkInTime')}
            label="Check-in time"
            placeholder="14:00"
            error={errors.checkInTime?.message}
          />
          <Input
            {...register('checkOutTime')}
            label="Check-out time"
            placeholder="11:00"
            error={errors.checkOutTime?.message}
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
          <Input
            {...register('heroImageUrl')}
            label="Hero image URL"
            placeholder="https://…"
            className="sm:col-span-2"
            error={errors.heroImageUrl?.message}
            required
          />

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <Checkbox {...register('featured')} label="Feature on the home page" />
            <Checkbox {...register('active')} label="Visible to customers" />
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this hotel?"
        description="Existing bookings keep their record, but the property leaves the catalogue."
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
                  await deleteHotel(deleteTarget.id).unwrap();
                  toast.success('Hotel deleted');
                  setDeleteTarget(null);
                } catch (error) {
                  toast.apiError(error, 'Could not delete the hotel');
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
