import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/features/auth/authSchemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { AuthLayout } from './AuthLayout';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword(values).unwrap();
      // The API always reports success so an attacker cannot enumerate accounts.
      setSentTo(values.email);
    } catch (error) {
      toast.apiError(error, 'Could not send the reset link');
    }
  };

  return (
    <>
      <Seo title="Reset your password" noIndex />

      <AuthLayout
        title={sentTo ? 'Check your inbox' : 'Forgot your password?'}
        subtitle={
          sentTo
            ? 'If an account exists for that address, a reset link is on its way.'
            : 'Enter the email on your account and we will send you a reset link.'
        }
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline dark:text-brand-400"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        }
      >
        {sentTo ? (
          <div className="surface-card rounded-2xl p-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <p className="mt-4 text-sm">
              We sent a password reset link to{' '}
              <span className="font-semibold">{sentTo}</span>. The link expires in 30 minutes.
            </p>
            <p className="text-muted mt-3 text-xs">
              Nothing arrived? Check your spam folder, or{' '}
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="font-semibold text-brand-700 underline dark:text-brand-400"
              >
                try another address
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              {...register('email')}
              type="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              required
            />

            <Button type="submit" size="lg" fullWidth loading={isLoading}>
              Send reset link
            </Button>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
