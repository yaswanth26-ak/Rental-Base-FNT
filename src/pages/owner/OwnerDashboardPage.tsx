import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckCircle, FiClock, FiHome } from 'react-icons/fi';
import * as bookingsApi from '@api/bookingsApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import type { OwnerDashboard } from '@/types';

export function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await bookingsApi.getOwnerDashboard();
        if (!active) return;
        setStats(response.data ?? null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load dashboard'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading dashboard..." />
      </div>
    );
  }

  if (error) return <Alert>{error}</Alert>;

  const cards = [
    {
      label: 'Total properties',
      value: stats?.total_properties ?? 0,
      icon: FiHome,
    },
    {
      label: 'Active properties',
      value: stats?.active_properties ?? 0,
      icon: FiCheckCircle,
    },
    {
      label: 'Total bookings',
      value: stats?.total_bookings ?? 0,
      icon: FiCalendar,
    },
    {
      label: 'Pending bookings',
      value: stats?.pending_bookings ?? 0,
      icon: FiClock,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Overview of your rental house and bookings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/owner/properties">
            <Button>My rental house</Button>
          </Link>
          <Link to="/owner/bookings">
            <Button variant="secondary">View bookings</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{label}</p>
              <Icon className="text-brand-orange" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-border bg-brand-surface/70 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Confirmed
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {stats?.confirmed_bookings ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-brand-surface/70 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Cancelled
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-400">
            {stats?.cancelled_bookings ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-brand-surface/70 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Active listings
          </p>
          <p className="mt-2 text-2xl font-semibold text-brand-orange">
            {stats?.active_properties ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
