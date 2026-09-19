import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { z } from 'zod';
import { CosmicBackground } from '@components/auth/CosmicBackground';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';
import { ApiError } from '@api/apiClient';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    phone: z
      .string()
      .trim()
      .min(10, 'Enter a valid phone number')
      .regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number'),
    email: z
      .string()
      .trim()
      .refine((value) => value === '' || z.email().safeParse(value).success, {
        message: 'Enter a valid email',
      }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterPage() {
  const { register, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    const parsed = registerSchema.safeParse({
      name,
      phone,
      email,
      password,
      confirmPassword,
    });

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
      const emailValue = parsed.data.email;
      const created = await register({
        name: parsed.data.name,
        phone: parsed.data.phone,
        password: parsed.data.password,
        email: emailValue ? emailValue : undefined,
      });
      navigate(created.role === 'admin' ? '/owner' : '/', { replace: true });
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : 'Unable to register. Please try again.'
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
            DownTown <span className="text-brand-orange">Stays</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Create your account for DownTown Stays
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-xl sm:p-8">
          {apiError ? <Alert className="mb-4">{apiError}</Alert> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <Input
              label="Phone"
              name="phone"
              inputMode="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
            <Input
              label="Email (optional)"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
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

            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <Button type="submit" className="w-full py-3" loading={submitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-brand-orange hover:text-brand-orange-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
