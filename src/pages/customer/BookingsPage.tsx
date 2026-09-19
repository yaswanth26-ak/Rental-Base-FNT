import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as bookingsApi from '@api/bookingsApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { EmptyState } from '@components/ui/EmptyState';
import { Spinner } from '@components/ui/Spinner';
import type { Booking } from '@/types';
import {
  bookingStatusClass,
  bookingStatusLabel,
  formatCurrency,
  formatBookingDateTime,
} from '@utils/format';

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await bookingsApi.listMyBookings();
        if (!active) return;
        setBookings(response.data ?? []);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load bookings'
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">My bookings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Track upcoming and past stays
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading bookings..." />
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Pick your dates on the home page to reserve the house."
          action={
            <Link
              to="/"
              className="rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-black"
            >
              DownTown Stays
            </Link>
          }
        />
      ) : null}

      <div className="space-y-3">
        {bookings.map((booking) => (
          <Link
            key={booking.id}
            to={`/bookings/${booking.id}`}
            className="block rounded-2xl border border-brand-border bg-brand-surface p-4 transition hover:border-brand-orange/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  {booking.property_name || `Property #${booking.property_id}`}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Check-in: {formatBookingDateTime(booking.check_in)}
                </p>
                <p className="text-sm text-gray-400">
                  Check-out: {formatBookingDateTime(booking.check_out)}
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  {booking.total_nights} night
                  {booking.total_nights === 1 ? '' : 's'} ·{' '}
                  {formatCurrency(booking.total_amount)}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${bookingStatusClass(booking.status)}`}
              >
                {bookingStatusLabel(booking.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
