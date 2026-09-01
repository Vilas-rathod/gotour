import { zodResolver } from '@hookform/resolvers/zod';
import { Luggage, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useAdminPackagesQuery,
  useCreatePackageMutation,
  useDeletePackageMutation,
  useUpdatePackageMutation,
  type SavePackageRequest,
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
import { formatCurrency, humanizeEnum } from '@/lib/format';
import type { PackageSummary, PackageType, TravelStyle } from '@/types/api';

const PACKAGE_TYPES: PackageType[] = [
  'GROUP',
  'PRIVATE',
  'HONEYMOON',
  'FAMILY',
  'ADVENTURE',
  'CRUISE',
  'WEEKEND',
];

const TRAVEL_STYLES: TravelStyle[] = [
  'LUXURY',
  'BUDGET',
  'BEACH',
  'MOUNTAIN',
  'CULTURAL',
  'WILDLIFE',
  'WELLNESS',
  'CITY_BREAK',
];

const schema = z
  .object({
    title: z.string().min(3, 'Enter a package title').max(160),
    slug: z.string().min(3, 'Slug is required').max(180),
    destinationSlug: z.string().min(2, 'Enter the destination slug').max(140),
    destinationName: z.string().min(2, 'Enter the destination name').max(120),
    destinationCountry: z.string().min(2, 'Enter the country').max(80),
    summary: z.string().min(10, 'At least 10 characters').max(400),
    description: z.string().min(30, 'At least 30 characters').max(6000),
    durationDays: z.coerce.number().int().min(1, 'At least 1 day').max(60),
    durationNights: z.coerce.number().int().min(0).max(60),
    price: z.coerce.number().min(1, 'Enter a price'),
    discountPrice: z.coerce.number().min(0).optional(),
    currency: z.string().length(3, 'Use a 3-letter code'),
    packageType: z.string().min(1, 'Pick a type'),
    travelStyle: z.string().min(1, 'Pick a style'),
    maxGroupSize: z.coerce.number().int().min(1).max(200).optional(),
    heroImageUrl: z.string().url('Enter a valid image URL'),
    featured: z.boolean(),
    trending: z.boolean(),
    active: z.boolean(),
  })
  .refine((values) => !values.discountPrice || values.discountPrice < values.price, {
    message: 'Discount price must be below the list price',
    path: ['discountPrice'],
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  title: '',
  slug: '',
  destinationSlug: '',
  destinationName: '',
  destinationCountry: '',
  summary: '',
  description: '',
  durationDays: 5,
  durationNights: 4,
  price: 0,
  discountPrice: undefined,
  currency: 'INR',
  packageType: 'GROUP',
  travelStyle: 'CULTURAL',
  maxGroupSize: undefined,
  heroImageUrl: '',
  featured: false,
  trending: false,
  active: true,
};

export default function AdminPackagesPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useAdminPackagesQuery({
    search: debouncedSearch || undefined,
    page,
    size: 12,
  });

  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();

  const [modal, setModal] = useState<{ open: boolean; editing: PackageSummary | null }>({
    open: false,
    editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<PackageSummary | null>(null);

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

  const openEdit = (row: PackageSummary) => {
    reset({
      ...EMPTY,
      title: row.title,
      slug: row.slug,
      destinationSlug: row.destinationSlug,
      destinationName: row.destinationName,
      destinationCountry: row.destinationCountry,
      summary: row.summary,
      description: row.summary,
      durationDays: row.durationDays,
      durationNights: row.durationNights,
      price: row.price,
      discountPrice: row.discountPrice ?? undefined,
      currency: row.currency,
      packageType: row.packageType,
      travelStyle: row.travelStyle,
      heroImageUrl: row.heroImageUrl,
      featured: row.featured,
      trending: row.trending,
      active: true,
    });
    setModal({ open: true, editing: row });
  };

  const onSubmit = async (values: FormValues) => {
    const payload: SavePackageRequest = {
      title: values.title,
      slug: values.slug,
      destinationSlug: values.destinationSlug,
      destinationName: values.destinationName,
      destinationCountry: values.destinationCountry,
      summary: values.summary,
      description: values.description,
      durationDays: values.durationDays,
      durationNights: values.durationNights,
      price: values.price,
      discountPrice: values.discountPrice ?? null,
      currency: values.currency.toUpperCase(),
      packageType: values.packageType as PackageType,
      travelStyle: values.travelStyle as TravelStyle,
      maxGroupSize: values.maxGroupSize ?? null,
      heroImageUrl: values.heroImageUrl,
      featured: values.featured,
      trending: values.trending,
      active: values.active,
    };

    try {
      if (modal.editing) {
        await updatePackage({ id: modal.editing.id, body: payload }).unwrap();
        toast.success('Package updated');
      } else {
        await createPackage(payload).unwrap();
        toast.success('Package created');
      }
      setModal({ open: false, editing: null });
    } catch (error) {
      toast.apiError(error, 'Could not save the package');
    }
  };

  const columns: Column<PackageSummary>[] = [
    {
      key: 'package',
      header: 'Package',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SmartImage
            src={row.heroImageUrl}
            alt={row.title}
            wrapperClassName="size-11 shrink-0 rounded-lg"
          />
          <div className="min-w-0 max-w-56">
            <p className="truncate text-sm font-medium">{row.title}</p>
            <p className="text-muted truncate font-mono text-xs">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      hideBelow: 'md',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{row.destinationName}</p>
          <p className="text-muted truncate text-xs">{row.destinationCountry}</p>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      hideBelow: 'lg',
      render: (row) => (
        <span className="text-sm">
          {row.durationDays}D / {row.durationNights}N
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (row) => (
        <div>
          {row.discountPrice !== null && (
            <p className="text-muted text-xs line-through tabular-nums">
              {formatCurrency(row.price, row.currency)}
            </p>
          )}
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(row.effectivePrice, row.currency)}
          </p>
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
      key: 'flags',
      header: 'Flags',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.featured && (
            <Badge variant="accent" size="sm">
              Featured
            </Badge>
          )}
          {row.trending && (
            <Badge variant="brand" size="sm">
              Trending
            </Badge>
          )}
          {!row.featured && !row.trending && <span className="text-muted text-xs">—</span>}
        </div>
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
            aria-label={`Edit ${row.title}`}
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.title}`}
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
      <Seo title="Manage packages" noIndex />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Tour packages</h1>
          <p className="text-muted mt-1 text-sm">
            {data ? `${data.totalElements} packages` : 'Loading…'}
          </p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
          New package
        </Button>
      </div>

      <div className="mb-5 max-w-md">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search by title or destination"
          leftIcon={<Search className="size-4" />}
          aria-label="Search packages"
        />
      </div>

      <DataTable
        caption="GoTour tour packages"
        columns={columns}
        rows={data?.content ?? []}
        getRowKey={(row) => row.id}
        loading={isLoading}
        emptyState={
          <EmptyState
            icon={Luggage}
            title="No packages yet"
            description="Create your first tour package to start selling."
            action={<Button onClick={openCreate}>Add package</Button>}
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
        title={modal.editing ? `Edit ${modal.editing.title}` : 'New package'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal({ open: false, editing: null })}>
              Cancel
            </Button>
            <Button loading={isCreating || isUpdating} onClick={handleSubmit(onSubmit)}>
              Save package
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input
            {...register('title')}
            label="Title"
            placeholder="Bali Honeymoon Escape"
            className="sm:col-span-2"
            error={errors.title?.message}
            required
            onBlur={(event) => {
              if (!watch('slug')) setValue('slug', slugify(event.target.value));
            }}
          />
          <Input
            {...register('slug')}
            label="Slug"
            placeholder="bali-honeymoon-escape"
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
            {...register('destinationCountry')}
            label="Country"
            placeholder="Indonesia"
            error={errors.destinationCountry?.message}
            required
          />
          <Textarea
            {...register('summary')}
            label="Summary"
            placeholder="The card copy — one or two lines."
            className="sm:col-span-2"
            error={errors.summary?.message}
            required
          />
          <Textarea
            {...register('description')}
            label="Full description"
            className="sm:col-span-2"
            error={errors.description?.message}
            required
          />
          <Input
            {...register('durationDays')}
            type="number"
            label="Duration (days)"
            error={errors.durationDays?.message}
            required
          />
          <Input
            {...register('durationNights')}
            type="number"
            label="Duration (nights)"
            error={errors.durationNights?.message}
            required
          />
          <Input
            {...register('price')}
            type="number"
            label="List price (per person)"
            error={errors.price?.message}
            required
          />
          <Input
            {...register('discountPrice')}
            type="number"
            label="Discount price"
            hint="Leave blank for no discount"
            error={errors.discountPrice?.message}
          />
          <Input
            {...register('currency')}
            label="Currency"
            maxLength={3}
            error={errors.currency?.message}
            required
          />
          <Input
            {...register('maxGroupSize')}
            type="number"
            label="Max group size"
            error={errors.maxGroupSize?.message}
          />
          <Select
            {...register('packageType')}
            label="Package type"
            error={errors.packageType?.message}
            required
          >
            {PACKAGE_TYPES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
          <Select
            {...register('travelStyle')}
            label="Travel style"
            error={errors.travelStyle?.message}
            required
          >
            {TRAVEL_STYLES.map((value) => (
              <option key={value} value={value}>
                {humanizeEnum(value)}
              </option>
            ))}
          </Select>
          <Input
            {...register('heroImageUrl')}
            label="Hero image URL"
            placeholder="https://…"
            className="sm:col-span-2"
            error={errors.heroImageUrl?.message}
            required
          />

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <Checkbox {...register('featured')} label="Featured" />
            <Checkbox {...register('trending')} label="Trending" />
            <Checkbox {...register('active')} label="Visible to customers" />
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this package?"
        description="Existing bookings keep their record, but the package leaves the catalogue."
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
                  await deletePackage(deleteTarget.id).unwrap();
                  toast.success('Package deleted');
                  setDeleteTarget(null);
                } catch (error) {
                  toast.apiError(error, 'Could not delete the package');
                }
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-muted text-sm">{deleteTarget?.title}</p>
      </Modal>
    </>
  );
}
