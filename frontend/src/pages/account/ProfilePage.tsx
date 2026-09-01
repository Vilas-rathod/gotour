import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, MapPin, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useChangePasswordMutation, useLogoutAllMutation } from '@/features/auth/authApi';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@/features/auth/authSchemas';
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useProfileQuery,
  useUpdateAddressMutation,
  useUpdateProfileMutation,
} from '@/features/profile/profileApi';
import { useAppDispatch } from '@/app/hooks';
import { userUpdated } from '@/features/auth/authSlice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import type { Address, AddressRequest, Gender } from '@/types/api';

// ---------------------------------------------------------------- schemas

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name').max(120),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  nationality: z.string().max(60).optional().or(z.literal('')),
  bio: z.string().max(500, 'Keep it under 500 characters').optional().or(z.literal('')),
  preferredCurrency: z.string().min(3).max(3),
  marketingOptIn: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  label: z.string().min(1, 'Give this address a label').max(40),
  line1: z.string().min(3, 'Enter the street address').max(160),
  line2: z.string().max(160).optional().or(z.literal('')),
  city: z.string().min(1, 'Enter the city').max(80),
  state: z.string().max(80).optional().or(z.literal('')),
  country: z.string().min(1, 'Enter the country').max(80),
  postalCode: z.string().min(3, 'Enter the postal code').max(16),
  defaultAddress: z.boolean(),
});

type AddressValues = z.infer<typeof addressSchema>;

// ------------------------------------------------------------------ page

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { data: profile, isLoading } = useProfileQuery();
  const { data: addresses } = useAddressesQuery();

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [logoutAll, { isLoading: isLoggingOutAll }] = useLogoutAllMutation();
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [addressModal, setAddressModal] = useState<{ open: boolean; editing: Address | null }>({
    open: false,
    editing: null,
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      avatarUrl: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      bio: '',
      preferredCurrency: 'INR',
      marketingOptIn: false,
    },
  });

  // Hydrate the form once the profile arrives.
  useEffect(() => {
    if (!profile) return;
    profileForm.reset({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
      gender: profile.gender ?? '',
      nationality: profile.nationality ?? '',
      bio: profile.bio ?? '',
      preferredCurrency: profile.preferredCurrency || 'INR',
      marketingOptIn: profile.marketingOptIn,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const addressForm = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      defaultAddress: false,
    },
  });

  const onSaveProfile = async (values: ProfileValues) => {
    try {
      const updated = await updateProfile({
        fullName: values.fullName,
        phone: values.phone || null,
        avatarUrl: values.avatarUrl || null,
        dateOfBirth: values.dateOfBirth || null,
        gender: (values.gender || null) as Gender | null,
        nationality: values.nationality || null,
        bio: values.bio || null,
        preferredCurrency: values.preferredCurrency,
        marketingOptIn: values.marketingOptIn,
      }).unwrap();

      // Keep the navbar avatar and greeting in step with the saved name.
      dispatch(userUpdated({ fullName: updated.fullName, phone: updated.phone }));
      toast.success('Profile updated');
    } catch (error) {
      toast.apiError(error, 'Could not save your profile');
    }
  };

  const onChangePassword = async (values: ChangePasswordValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success('Password changed', 'Use your new password next time you sign in.');
      passwordForm.reset();
      setPasswordOpen(false);
    } catch (error) {
      toast.apiError(error, 'Could not change your password');
    }
  };

  const openAddressModal = (address: Address | null) => {
    addressForm.reset(
      address
        ? {
            label: address.label,
            line1: address.line1,
            line2: address.line2 ?? '',
            city: address.city,
            state: address.state ?? '',
            country: address.country,
            postalCode: address.postalCode,
            defaultAddress: address.defaultAddress,
          }
        : {
            label: '',
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            defaultAddress: false,
          },
    );
    setAddressModal({ open: true, editing: address });
  };

  const onSaveAddress = async (values: AddressValues) => {
    const payload: AddressRequest = {
      label: values.label,
      line1: values.line1,
      line2: values.line2 || null,
      city: values.city,
      state: values.state || null,
      country: values.country,
      postalCode: values.postalCode,
      defaultAddress: values.defaultAddress,
    };

    try {
      if (addressModal.editing) {
        await updateAddress({ id: addressModal.editing.id, body: payload }).unwrap();
        toast.success('Address updated');
      } else {
        await createAddress(payload).unwrap();
        toast.success('Address added');
      }
      setAddressModal({ open: false, editing: null });
    } catch (error) {
      toast.apiError(error, 'Could not save the address');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <Seo title="My profile" noIndex />

      <h2 className="mb-6 text-2xl">Profile & settings</h2>

      {/* ------------------------------------------------------- profile */}
      <Card>
        <CardBody>
          <h3 className="font-display text-lg font-semibold">Personal details</h3>
          <p className="text-muted mt-1 text-sm">
            These details prefill your bookings. Your email cannot be changed here.
          </p>

          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            className="mt-5 grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <Input
              {...profileForm.register('fullName')}
              label="Full name"
              error={profileForm.formState.errors.fullName?.message}
              required
            />
            <Input label="Email address" value={profile?.email ?? ''} disabled readOnly />
            <Input
              {...profileForm.register('phone')}
              type="tel"
              label="Phone number"
              placeholder="+91 98765 43210"
              error={profileForm.formState.errors.phone?.message}
            />
            <Input
              {...profileForm.register('dateOfBirth')}
              type="date"
              label="Date of birth"
              error={profileForm.formState.errors.dateOfBirth?.message}
            />
            <Select {...profileForm.register('gender')} label="Gender">
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </Select>
            <Input
              {...profileForm.register('nationality')}
              label="Nationality"
              placeholder="Indian"
              error={profileForm.formState.errors.nationality?.message}
            />
            <Select {...profileForm.register('preferredCurrency')} label="Preferred currency">
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — Pound Sterling</option>
              <option value="AED">AED — UAE Dirham</option>
            </Select>
            <Input
              {...profileForm.register('avatarUrl')}
              label="Avatar image URL"
              placeholder="https://…"
              error={profileForm.formState.errors.avatarUrl?.message}
            />
            <Textarea
              {...profileForm.register('bio')}
              label="About you"
              placeholder="Where have you been, where are you going?"
              className="sm:col-span-2"
              error={profileForm.formState.errors.bio?.message}
            />

            <div className="sm:col-span-2">
              <Checkbox
                {...profileForm.register('marketingOptIn')}
                label="Email me travel deals and seasonal offers"
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" loading={isSaving} leftIcon={<Save className="size-4" />}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* ----------------------------------------------------- addresses */}
      <Card className="mt-5">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Saved addresses</h3>
              <p className="text-muted mt-1 text-sm">Used for invoices and travel documents.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAddressModal(null)}
              leftIcon={<Plus className="size-4" />}
            >
              Add address
            </Button>
          </div>

          {!addresses || addresses.length === 0 ? (
            <p className="text-muted mt-5 rounded-xl border border-dashed p-4 text-sm">
              No addresses saved yet.
            </p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <li key={address.id}>
                  <div className="surface-card h-full rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-brand-ink-soft" aria-hidden />
                        <span className="text-sm font-semibold">{address.label}</span>
                        {address.defaultAddress && (
                          <Badge variant="brand" size="sm">
                            Default
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${address.label}`}
                          onClick={() => openAddressModal(address)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${address.label}`}
                          className="text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          onClick={async () => {
                            try {
                              await deleteAddress(address.id).unwrap();
                              toast.success('Address removed');
                            } catch (error) {
                              toast.apiError(error);
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <address className="text-muted mt-2 text-sm not-italic">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city}
                      {address.state ? `, ${address.state}` : ''} {address.postalCode}
                      <br />
                      {address.country}
                    </address>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* ------------------------------------------------------ security */}
      <Card className="mt-5">
        <CardBody>
          <h3 className="font-display text-lg font-semibold">Security</h3>
          <p className="text-muted mt-1 text-sm">
            Change your password or sign out everywhere if you suspect your account was accessed.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              onClick={() => setPasswordOpen(true)}
              leftIcon={<Lock className="size-4" />}
            >
              Change password
            </Button>
            <Button
              variant="ghost"
              loading={isLoggingOutAll}
              onClick={async () => {
                try {
                  await logoutAll().unwrap();
                  toast.success('Signed out of all devices');
                } catch (error) {
                  toast.apiError(error);
                }
              }}
            >
              Sign out everywhere
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* --------------------------------------------------- modals */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={isChangingPassword}
              onClick={passwordForm.handleSubmit(onChangePassword)}
            >
              Update password
            </Button>
          </div>
        }
      >
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
          noValidate
        >
          <Input
            {...passwordForm.register('currentPassword')}
            type="password"
            label="Current password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.currentPassword?.message}
            required
          />
          <Input
            {...passwordForm.register('newPassword')}
            type="password"
            label="New password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.newPassword?.message}
            required
          />
          <Input
            {...passwordForm.register('confirmPassword')}
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            required
          />
        </form>
      </Modal>

      <Modal
        open={addressModal.open}
        onClose={() => setAddressModal({ open: false, editing: null })}
        title={addressModal.editing ? 'Edit address' : 'Add address'}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setAddressModal({ open: false, editing: null })}
            >
              Cancel
            </Button>
            <Button
              loading={isCreatingAddress || isUpdatingAddress}
              onClick={addressForm.handleSubmit(onSaveAddress)}
            >
              Save address
            </Button>
          </div>
        }
      >
        <form
          onSubmit={addressForm.handleSubmit(onSaveAddress)}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <Input
            {...addressForm.register('label')}
            label="Label"
            placeholder="Home, Office…"
            className="sm:col-span-2"
            error={addressForm.formState.errors.label?.message}
            required
          />
          <Input
            {...addressForm.register('line1')}
            label="Address line 1"
            className="sm:col-span-2"
            error={addressForm.formState.errors.line1?.message}
            required
          />
          <Input
            {...addressForm.register('line2')}
            label="Address line 2"
            className="sm:col-span-2"
            error={addressForm.formState.errors.line2?.message}
          />
          <Input
            {...addressForm.register('city')}
            label="City"
            error={addressForm.formState.errors.city?.message}
            required
          />
          <Input
            {...addressForm.register('state')}
            label="State / region"
            error={addressForm.formState.errors.state?.message}
          />
          <Input
            {...addressForm.register('country')}
            label="Country"
            error={addressForm.formState.errors.country?.message}
            required
          />
          <Input
            {...addressForm.register('postalCode')}
            label="Postal code"
            error={addressForm.formState.errors.postalCode?.message}
            required
          />
          <div className="sm:col-span-2">
            <Checkbox
              {...addressForm.register('defaultAddress')}
              label="Use as my default address"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
