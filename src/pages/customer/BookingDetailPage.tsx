import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import * as bookingsApi from '@api/bookingsApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import type { Booking } from '@/types';
import {
  bookingStatusClass,
  bookingStatusLabel,
  formatCurrency,
  formatBookingDateTime,
  formatBookingTime,
  formatDate,
} from '@utils/format';

export function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await bookingsApi.getBooking(id);
        if (!active) return;
        setBooking(response.data ?? null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load booking'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleCancel() {
    if (!booking) return;
    setActionError('');
    setActionSuccess('');
    setCancelling(true);
    try {
      const response = await bookingsApi.cancelBooking(booking.id);
      setBooking(response.data ?? booking);
      setActionSuccess(response.message || 'Booking cancelled');
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Unable to cancel booking'
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading booking..." />
      </div>
    );
  }

  if (error || !booking) {
    return <Alert>{error || 'Booking not found'}</Alert>;
  }

  const canCancel =
    booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-orange"
      >
        <FiArrowLeft /> Back to bookings
      </Link>

      <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {booking.property_name || `Property #${booking.property_id}`}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Booking #{booking.id}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${bookingStatusClass(booking.status)}`}
          >
            {bookingStatusLabel(booking.status)}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Check-in
            </dt>
            <dd className="mt-1 text-white">{formatDate(booking.check_in)}</dd>
            <dd className="text-sm text-brand-orange">
              {formatBookingTime(booking.check_in)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Check-out
            </dt>
            <dd className="mt-1 text-white">{formatDate(booking.check_out)}</dd>
            <dd className="text-sm text-brand-orange">
              {formatBookingTime(booking.check_out)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Nights
            </dt>
            <dd className="mt-1 text-white">{booking.total_nights}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Total
            </dt>
            <dd className="mt-1 font-semibold text-brand-orange">
              {formatCurrency(booking.total_amount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              City
            </dt>
            <dd className="mt-1 text-white">{booking.property_city || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Schedule
            </dt>
            <dd className="mt-1 text-sm text-gray-300">
              {formatBookingDateTime(booking.check_in)} →{' '}
              {formatBookingDateTime(booking.check_out)}
            </dd>
          </div>
        </dl>

        {actionError ? <Alert className="mt-5">{actionError}</Alert> : null}
        {actionSuccess ? (
          <Alert tone="success" className="mt-5">
            {actionSuccess}
          </Alert>
        ) : null}

        {canCancel ? (
          <Button
            variant="danger"
            className="mt-6"
            loading={cancelling}
            onClick={handleCancel}
          >
            Cancel booking
          </Button>
        ) : null}
      </div>
    </div>
  );
}
