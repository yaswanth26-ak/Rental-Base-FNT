const BOOKING_TIMEZONE = 'Asia/Kolkata';

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function toDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Date only in Asia/Kolkata, e.g. "19 Sept 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  if (!date) return value;
  return date.toLocaleDateString('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Time only in Asia/Kolkata, e.g. "10:00 AM" / "9:00 AM" */
export function formatBookingTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString('en-US', {
    timeZone: BOOKING_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Inline booking timestamp in Asia/Kolkata:
 * "19 Sept 2026, 10:00 AM"
 */
export function formatBookingDateTime(
  value: string | null | undefined
): string {
  if (!value) return '—';
  const date = toDate(value);
  if (!date) return value;
  const day = formatDate(value);
  const time = formatBookingTime(value);
  return `${day}, ${time}`;
}

/**
 * Fixed house policy labels for a selected date-only value.
 */
export function formatFixedCheckMoment(
  dateOnly: string,
  kind: 'checkIn' | 'checkOut' = 'checkIn'
): {
  dateLabel: string;
  timeLabel: string;
} {
  return {
    dateLabel: formatDate(dateOnly),
    timeLabel: kind === 'checkOut' ? '9:00 AM' : '10:00 AM',
  };
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = checkIn.includes('T') ? checkIn.slice(0, 10) : checkIn;
  const outDate = checkOut.includes('T') ? checkOut.slice(0, 10) : checkOut;
  const start = new Date(`${inDate}T00:00:00Z`);
  const end = new Date(`${outDate}T00:00:00Z`);
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return nights > 0 ? nights : 0;
}

export function bookingStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function bookingStatusClass(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'pending':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'cancelled':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'completed':
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    default:
      return 'bg-white/10 text-gray-300 border-white/10';
  }
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
