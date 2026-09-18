import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDroplet, FiHome, FiMapPin, FiUsers, FiX } from 'react-icons/fi';
import * as bookingsApi from '@api/bookingsApi';
import * as propertiesApi from '@api/propertiesApi';
import { ApiError } from '@api/apiClient';
import { Alert } from '@components/ui/Alert';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import type {
  AvailabilityResult,
  Property,
  SuggestedAvailableDate,
} from '@/types';
import {
  formatBookingDateTime,
  formatCurrency,
  formatDate,
  nightsBetween,
} from '@utils/format';

interface HouseDetailProps {
  property: Property;
  greetingName?: string;
}

function toFixedCheckInTimestamp(dateOnly: string): string {
  return `${dateOnly}T10:00:00+05:30`;
}

function toFixedCheckOutTimestamp(dateOnly: string): string {
  return `${dateOnly}T09:00:00+05:30`;
}

export function HouseDetail({ property, greetingName }: HouseDetailProps) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null
  );
  const [availabilityError, setAvailabilityError] = useState('');
  const [checking, setChecking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedAvailableDate[]>([]);
  const [refreshingSuggestions, setRefreshingSuggestions] = useState(false);

  const images = useMemo(() => {
    if (property.images?.length) {
      return property.images.map((img) => img.image_url);
    }
    if (property.main_image) return [property.main_image];
    return [];
  }, [property]);

  const locationLabel = useMemo(
    () =>
      [property.address, property.city, property.state]
        .filter(Boolean)
        .join(', '),
    [property.address, property.city, property.state]
  );

  const directionsUrl = locationLabel
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationLabel)}`
    : null;

  const nightsPreview = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const canCheckAvailability =
    Boolean(checkIn) && Boolean(checkOut) && nightsPreview > 0;

  useEffect(() => {
    if (!showUnavailableModal && !showConflictModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showUnavailableModal, showConflictModal]);

  function clearAvailabilityResult() {
    setAvailability(null);
    setAvailabilityError('');
    setBookingError('');
    setBookingSuccess('');
    setShowUnavailableModal(false);
    setShowConflictModal(false);
    setSuggestions([]);
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value);
    clearAvailabilityResult();
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value);
    clearAvailabilityResult();
  }

  function scrollToBooking() {
    document.getElementById('booking-panel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  async function handleCheckAvailability() {
    setAvailabilityError('');
    setBookingError('');
    setBookingSuccess('');
    setAvailability(null);
    setShowUnavailableModal(false);
    setShowConflictModal(false);
    setSuggestions([]);

    if (!canCheckAvailability) {
      setAvailabilityError('Select valid check-in and check-out dates');
      return;
    }

    setChecking(true);
    try {
      const response = await propertiesApi.checkAvailability(
        property.id,
        checkIn,
        checkOut
      );
      const data = response.data ?? { available: false };
      setAvailability(data);

      if (data.available === false) {
        setSuggestions(data.suggestedDates ?? []);
        setShowUnavailableModal(true);
      }
    } catch (err) {
      setAvailabilityError(
        err instanceof ApiError
          ? err.message
          : 'Unable to check availability. Please try again.'
      );
    } finally {
      setChecking(false);
    }
  }

  function applySuggestedRange(suggestion: SuggestedAvailableDate) {
    setCheckIn(suggestion.checkIn);
    setCheckOut(suggestion.checkOut);
    setAvailability({
      available: true,
      checkIn: toFixedCheckInTimestamp(suggestion.checkIn),
      checkOut: toFixedCheckOutTimestamp(suggestion.checkOut),
      totalNights: suggestion.totalNights,
      totalAmount: suggestion.totalAmount,
    });
    setSuggestions([]);
    setShowUnavailableModal(false);
    setShowConflictModal(false);
    setAvailabilityError('');
    setBookingError('');
    setBookingSuccess('');
  }

  async function refreshSuggestionsAndOpenModal() {
    if (!checkIn || !checkOut) return;
    setRefreshingSuggestions(true);
    try {
      const response = await propertiesApi.checkAvailability(
        property.id,
        checkIn,
        checkOut
      );
      const data = response.data ?? { available: false };
      setSuggestions(data.suggestedDates ?? []);
      setAvailability({ available: false, suggestedDates: data.suggestedDates });
      setShowConflictModal(false);
      setShowUnavailableModal(true);
    } catch (err) {
      setBookingError(
        err instanceof ApiError
          ? err.message
          : 'Unable to load alternative dates. Please try again.'
      );
      setShowConflictModal(false);
    } finally {
      setRefreshingSuggestions(false);
    }
  }

  async function handleBooking(event: FormEvent) {
    event.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!availability?.available) {
      setBookingError('Please check availability before booking');
      return;
    }

    setSubmitting(true);
    try {
      const response = await bookingsApi.createBooking({
        property_id: property.id,
        check_in: checkIn,
        check_out: checkOut,
      });
      setBookingSuccess(response.message || 'Booking created successfully');
      if (response.data?.id) {
        setTimeout(() => navigate(`/bookings/${response.data!.id}`), 800);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAvailability({ available: false });
        setShowConflictModal(true);
      } else {
        setBookingError(
          err instanceof ApiError ? err.message : 'Booking failed'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {greetingName ? (
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-orange">
            Welcome, {greetingName}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Book your stay
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            This is our private rental house — reserve your dates below.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
            <div className="aspect-[16/10] bg-brand-charcoal">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-600">
                  <FiHome className="h-12 w-12" />
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                      activeImage === index
                        ? 'border-brand-orange'
                        : 'border-transparent opacity-70'
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  {property.name}
                </h2>
                {directionsUrl ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Get directions to ${property.name}`}
                    className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-gray-400 transition-colors hover:text-brand-orange active:text-brand-orange"
                  >
                    <FiMapPin
                      className="shrink-0 text-brand-orange"
                      aria-hidden
                    />
                    {locationLabel}
                  </a>
                ) : null}
              </div>
              <Button
                type="button"
                className="lg:hidden"
                onClick={scrollToBooking}
              >
                Check dates
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="inline-flex items-center gap-2">
                <FiHome className="text-brand-orange" />
                {property.bedrooms} bedrooms
              </span>
              <span className="inline-flex items-center gap-2">
                <FiDroplet className="text-brand-orange" />
                {property.bathrooms} bathrooms
              </span>
              <span className="inline-flex items-center gap-2">
                <FiUsers className="text-brand-orange" />
                Up to {property.max_guests} guests
              </span>
            </div>

            {property.description ? (
              <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                {property.description}
              </p>
            ) : null}

            {property.amenities && property.amenities.length > 0 ? (
              <div className="mt-6">
                <h3 className="font-display text-lg font-semibold text-white">
                  Amenities
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity.id}
                      className="rounded-full border border-brand-border bg-black/30 px-3 py-1 text-xs text-gray-300"
                    >
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside
          id="booking-panel"
          className="h-fit scroll-mt-24 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card lg:sticky lg:top-24"
        >
          <p className="font-display text-3xl font-bold text-white">
            {formatCurrency(property.price_per_day)}
            <span className="ml-1 text-sm font-normal text-gray-400">
              / day
            </span>
          </p>

          <form onSubmit={handleBooking} className="mt-5 space-y-3">
            <Input
              label="Check-in"
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
            />
            <Input
              label="Check-out"
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Fixed house timings — select dates only.
              <br />
              Check-in: 10:00 AM · Check-out: 9:00 AM
            </p>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={!canCheckAvailability || checking}
              loading={checking}
              onClick={() => void handleCheckAvailability()}
            >
              {checking ? 'Checking availability...' : 'Check Availability'}
            </Button>

            {availabilityError ? <Alert>{availabilityError}</Alert> : null}

            {availability?.available === true ? (
              <div className="rounded-xl border border-brand-orange/40 bg-black/25 p-4">
                <p className="font-medium text-white">✓ House is available</p>
                <div className="mt-3 space-y-1 text-sm text-gray-300">
                  <p>
                    Check-in:{' '}
                    <span className="text-white">
                      {formatBookingDateTime(availability.checkIn)}
                    </span>
                  </p>
                  <p>
                    Check-out:{' '}
                    <span className="text-white">
                      {formatBookingDateTime(availability.checkOut)}
                    </span>
                  </p>
                  <p className="pt-1 text-gray-400">
                    {availability.totalNights} night
                    {availability.totalNights === 1 ? '' : 's'} ·{' '}
                    <span className="font-semibold text-brand-orange">
                      {formatCurrency(availability.totalAmount)}
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            {bookingError ? <Alert>{bookingError}</Alert> : null}
            {bookingSuccess ? (
              <Alert tone="success">{bookingSuccess}</Alert>
            ) : null}

            {availability?.available === true ? (
              <Button type="submit" className="w-full" loading={submitting}>
                Book Now
              </Button>
            ) : null}
          </form>
        </aside>
      </div>

      {showUnavailableModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-label="Close dialog backdrop"
            onClick={() => setShowUnavailableModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unavailable-title"
            className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-brand-border bg-brand-charcoal p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="unavailable-title"
                  className="font-display text-xl font-bold text-white"
                >
                  ✕ Dates Not Available
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Sorry, these dates are already booked.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-brand-border p-2 text-gray-400 hover:text-white"
                onClick={() => setShowUnavailableModal(false)}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-5">
              <h3 className="text-xs uppercase tracking-wide text-gray-500">
                Available Dates
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Fixed timings — Check-in: 10:00 AM · Check-out: 9:00 AM
              </p>

              {suggestions.length === 0 ? (
                <p className="mt-3 text-sm text-gray-300">
                  Those dates are unavailable and no nearby dates are currently
                  available.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={`${suggestion.checkIn}-${suggestion.checkOut}`}
                      className="rounded-xl border border-brand-border bg-black/30 p-3"
                    >
                      <p className="font-medium text-white">
                        {formatDate(suggestion.checkIn)} –{' '}
                        {formatDate(suggestion.checkOut)}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {suggestion.totalNights} night
                        {suggestion.totalNights === 1 ? '' : 's'} ·{' '}
                        <span className="text-brand-orange">
                          {formatCurrency(suggestion.totalAmount)}
                        </span>
                      </p>
                      <Button
                        type="button"
                        className="mt-3 w-full"
                        onClick={() => applySuggestedRange(suggestion)}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => setShowUnavailableModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      ) : null}

      {showConflictModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-label="Close dialog backdrop"
            onClick={() => setShowConflictModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-brand-border bg-brand-charcoal p-5 shadow-card"
          >
            <h2 className="font-display text-xl font-bold text-white">
              Dates no longer available
            </h2>
            <p className="mt-3 text-sm text-gray-300">
              These dates were just booked by another customer. Please choose
              another available date.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="w-full"
                loading={refreshingSuggestions}
                onClick={() => void refreshSuggestionsAndOpenModal()}
              >
                Choose Another Date
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setShowConflictModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
