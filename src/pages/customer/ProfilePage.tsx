import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import * as usersApi from '@api/usersApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@context/AuthContext';

const profileSchema = z.object({
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
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(6, 'New password must be at least 6 characters'),
    confirm_password: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export function ProfilePage() {
  const { user, setSession, token, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileErrors({});
    setProfileError('');
    setProfileMessage('');

    const parsed = profileSchema.safeParse({ name, phone, email });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? 'form');
        if (!next[key]) next[key] = issue.message;
      });
      setProfileErrors(next);
      return;
    }

    setSavingProfile(true);
    try {
      const response = await usersApi.updateProfile({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || undefined,
      });
      if (response.data && token) {
        setSession(response.data, token);
      } else {
        await refreshUser();
      }
      setProfileMessage(response.message || 'Profile updated');
    } catch (err) {
      setProfileError(
        err instanceof ApiError ? err.message : 'Failed to update profile'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordErrors({});
    setPasswordError('');
    setPasswordMessage('');

    const parsed = passwordSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? 'form');
        if (!next[key]) next[key] = issue.message;
      });
      setPasswordErrors(next);
      return;
    }

    setSavingPassword(true);
    try {
      const response = await usersApi.changePassword({
        current_password: parsed.data.current_password,
        new_password: parsed.data.new_password,
      });
      setPasswordMessage(response.message || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : 'Failed to change password'
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your account details
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5"
      >
        <h2 className="font-display text-lg font-semibold text-white">
          Account info
        </h2>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={profileErrors.name}
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={profileErrors.phone}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={profileErrors.email}
        />
        <p className="text-xs capitalize text-gray-500">Role: {user?.role}</p>
        {profileError ? <Alert>{profileError}</Alert> : null}
        {profileMessage ? (
          <Alert tone="success">{profileMessage}</Alert>
        ) : null}
        <Button type="submit" loading={savingProfile}>
          Save profile
        </Button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5"
      >
        <h2 className="font-display text-lg font-semibold text-white">
          Change password
        </h2>
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={passwordErrors.current_password}
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={passwordErrors.new_password}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={passwordErrors.confirm_password}
        />
        {passwordError ? <Alert>{passwordError}</Alert> : null}
        {passwordMessage ? (
          <Alert tone="success">{passwordMessage}</Alert>
        ) : null}
        <Button type="submit" variant="secondary" loading={savingPassword}>
          Update password
        </Button>
      </form>
    </div>
  );
}
