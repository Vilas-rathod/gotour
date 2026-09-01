import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/authSchemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { AuthLayout } from './AuthLayout';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    try {
      await resetPassword({ token, newPassword: values.newPassword }).unwrap();
      toast.success('Password updated', 'Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.apiError(error, 'Could not reset your password');
    }
  };

  return (
    <>
      <Seo title="Set a new password" noIndex />

      <AuthLayout
        title="Set a new password"
        subtitle="Choose a password you have not used on GoTour before."
        footer={
          <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
            Back to sign in
          </Link>
        }
      >
        {!token ? (
          <div className="surface-card rounded-2xl p-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="size-7" aria-hidden />
            </span>
            <p className="mt-4 text-sm">
              This reset link is missing its token. Request a new link and try again.
            </p>
            <Button className="mt-5" onClick={() => navigate('/forgot-password')}>
              Request a new link
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              {...register('newPassword')}
              type="password"
              label="New password"
              autoComplete="new-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.newPassword?.message}
              required
            />
            <Input
              {...register('confirmPassword')}
              type="password"
              label="Confirm new password"
              autoComplete="new-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.confirmPassword?.message}
              required
            />

            <Button type="submit" size="lg" fullWidth loading={isLoading}>
              Update password
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
