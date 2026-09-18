import { apiClient } from '@api/apiClient';
import type {
  ApiResponse,
  Booking,
  BookingStatus,
  CreateBookingPayload,
  OwnerDashboard,
} from '@/types';

export async function createBooking(payload: CreateBookingPayload) {
  return apiClient.post<ApiResponse<Booking>>('/bookings', payload);
}

export async function listMyBookings() {
  return apiClient.get<ApiResponse<Booking[]>>('/bookings/my');
}

export async function listOwnerBookings() {
  return apiClient.get<ApiResponse<Booking[]>>('/bookings/owner');
}

export async function getBooking(id: number | string) {
  return apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
}

export async function cancelBooking(id: number | string) {
  return apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
}

export async function updateBookingStatus(
  id: number | string,
  status: BookingStatus
) {
  return apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, {
    status,
  });
}

export async function listPropertyBookings(propertyId: number | string) {
  return apiClient.get<ApiResponse<Booking[]>>(
    `/properties/${propertyId}/bookings`
  );
}

export async function getOwnerDashboard() {
  return apiClient.get<ApiResponse<OwnerDashboard>>('/owner/dashboard');
}
