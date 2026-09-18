import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { z } from 'zod';
import { CosmicBackground } from '@components/auth/CosmicBackground';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { ApiError } from '@api/apiClient';

const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage =
    (location.state as { successMessage?: string } | null)?.successMessage;

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/owner' : '/'} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setApiError('');
    setErrors({});

    const parsed = loginSchema.safeParse({ phone, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? 'form');
        if (!next[key]) next[key] = issue.message;
      });
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login(parsed.data);
      navigate(loggedIn.role === 'admin' ? '/owner' : '/', { replace: true });
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : 'Unable to log in. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 font-body text-white">
      <CosmicBackground />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <p className="font-display text-4xl font-bold tracking-tight">
            Rental<span className="text-brand-orange">Base</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to book the house
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-xl animate-pulse-glow sm:p-8">
          {successMessage ? (
            <Alert tone="success" className="mb-4">
              {successMessage}
            </Alert>
          ) : null}
          {apiError ? (
            <Alert className="mb-4">{apiError}</Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="pr-11"
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-gray-400 hover:text-white"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <Button type="submit" className="w-full py-3" loading={submitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            New here?{' '}
            <Link
              to="/register"
              className="font-medium text-brand-orange hover:text-brand-orange-hover"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
