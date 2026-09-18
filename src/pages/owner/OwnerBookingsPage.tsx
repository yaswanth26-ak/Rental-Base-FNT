import { useEffect, useState } from 'react';
import * as bookingsApi from '@api/bookingsApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { Select } from '@components/ui/FormControls';
import { Spinner } from '@components/ui/Spinner';
import type { Booking, BookingStatus } from '@/types';
import {
  bookingStatusClass,
  bookingStatusLabel,
  formatCurrency,
  formatBookingDateTime,
} from '@utils/format';

const STATUS_OPTIONS: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await bookingsApi.listOwnerBookings();
      setBookings(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load bookings'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(bookingId: number, status: BookingStatus) {
    setUpdatingId(bookingId);
    setActionError('');
    try {
      const response = await bookingsApi.updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? response.data ?? b : b))
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to update status'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Property bookings
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Review and update booking statuses
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading bookings..." />
        </div>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}
      {actionError ? <Alert>{actionError}</Alert> : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="When guests book your properties, they will appear here."
        />
      ) : null}

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border border-brand-border bg-brand-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  {booking.property_name || `Property #${booking.property_id}`}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Customer: {booking.customer_name || 'Guest'}
                  {booking.customer_phone ? ` · ${booking.customer_phone}` : ''}
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Check-in: {formatBookingDateTime(booking.check_in)}
                </p>
                <p className="text-sm text-gray-300">
                  Check-out: {formatBookingDateTime(booking.check_out)}
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  {booking.total_nights} night
                  {booking.total_nights === 1 ? '' : 's'} · Amount{' '}
                  {formatCurrency(booking.total_amount)}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${bookingStatusClass(booking.status)}`}
              >
                {bookingStatusLabel(booking.status)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1">
                <Select
                  label="Update status"
                  value={booking.status}
                  onChange={(e) =>
                    void updateStatus(
                      booking.id,
                      e.target.value as BookingStatus
                    )
                  }
                  disabled={updatingId === booking.id}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {bookingStatusLabel(status)}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                variant="secondary"
                loading={updatingId === booking.id}
                onClick={() => void load()}
              >
                Refresh
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
