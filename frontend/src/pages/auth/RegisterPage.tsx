import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { credentialsReceived } from '@/features/auth/authSlice';
import { useRegisterMutation } from '@/features/auth/authApi';
import { passwordStrength, registerSchema, type RegisterValues } from '@/features/auth/authSchemas';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Input';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { AuthLayout } from './AuthLayout';

const STRENGTH_LABEL = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = [
  'bg-[var(--border-subtle)]',
  'bg-rose-500',
  'bg-amber-500',
  'bg-brand-500',
  'bg-emerald-500',
];

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: undefined,
    },
  });

  const strength = passwordStrength(watch('password') ?? '');

  const onSubmit = async (values: RegisterValues) => {
    try {
      const response = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      }).unwrap();

      dispatch(credentialsReceived(response));
      toast.success('Account created', 'Welcome to GoTour.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.apiError(error, 'Could not create your account');
    }
  };

  return (
    <>
      <Seo
        title="Create your account"
        description="Join GoTour to save destinations, book trips and manage your itineraries."
      />

      <AuthLayout
        title="Start your next journey"
        subtitle="Create a free account to book trips, save favourites and track every itinerary."
        footer={
          <span className="text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
              Sign in
            </Link>
          </span>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            {...register('fullName')}
            label="Full name"
            placeholder="Priya Sharma"
            autoComplete="name"
            leftIcon={<User className="size-4" />}
            error={errors.fullName?.message}
            required
          />

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

          <Input
            {...register('phone')}
            type="tel"
            label="Phone number"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            leftIcon={<Phone className="size-4" />}
            error={errors.phone?.message}
            hint="Optional — used only for booking updates"
          />

          <div>
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              leftIcon={<Lock className="size-4" />}
              error={errors.password?.message}
              required
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-muted rounded-full p-2 transition-colors hover:text-[var(--text-strong)]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />

            {watch('password') && (
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex flex-1 gap-1" role="presentation">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        step <= strength ? STRENGTH_COLOR[strength] : 'bg-[var(--border-subtle)]',
                      )}
                    />
                  ))}
                </div>
                <span className="text-muted text-xs font-medium">{STRENGTH_LABEL[strength]}</span>
              </div>
            )}
          </div>

          <Input
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            leftIcon={<Lock className="size-4" />}
            error={errors.confirmPassword?.message}
            required
          />

          <div>
            <Checkbox
              {...register('acceptTerms')}
              label={
                <>
                  I agree to the GoTour{' '}
                  <Link to="/policies/terms" className="text-brand-700 underline dark:text-brand-400">
                    terms of service
                  </Link>{' '}
                  and{' '}
                  <Link to="/policies/privacy" className="text-brand-700 underline dark:text-brand-400">
                    privacy policy
                  </Link>
                </>
              }
            />
            {errors.acceptTerms && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-rose-500">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" fullWidth loading={isLoading}>
            Create account
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
