import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { credentialsReceived } from '@/features/auth/authSlice';
import { useLoginMutation } from '@/features/auth/authApi';
import { loginSchema, type LoginValues } from '@/features/auth/authSchemas';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Input';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { AuthLayout } from './AuthLayout';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = (location.state as LocationState | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const response = await login({ email: values.email, password: values.password }).unwrap();
      dispatch(credentialsReceived(response));
      toast.success(`Welcome back, ${response.user.fullName.split(' ')[0]}`);

      // Admins land in the dashboard unless they were sent here from a page.
      const isAdmin = response.user.roles.includes('ADMIN');
      navigate(redirectTo !== '/' ? redirectTo : isAdmin ? '/admin' : '/', { replace: true });
    } catch (error) {
      toast.apiError(error, 'Sign in failed');
    }
  };

  return (
    <>
      <Seo title="Sign in" description="Sign in to your GoTour account." noIndex />

      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to manage bookings, saved trips and itineraries."
        footer={
          <span className="text-muted">
            New to GoTour?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
              Create an account
            </Link>
          </span>
        }
      >
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

          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
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

          <div className="flex items-center justify-between">
            <Checkbox {...register('rememberMe')} label="Keep me signed in" />
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={isLoading}>
            Sign in
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
