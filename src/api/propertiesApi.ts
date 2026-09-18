import { apiClient } from '@api/apiClient';
import type {
  AddImagePayload,
  ApiResponse,
  AvailabilityResult,
  CreatePropertyPayload,
  Property,
  PropertyFilters,
  PropertyImage,
  PropertySummary,
  UpdatePropertyPayload,
} from '@/types';

export async function listProperties(filters: PropertyFilters = {}) {
  return apiClient.get<ApiResponse<PropertySummary[]>>(
    '/properties',
    {
      city: filters.city,
      min_price: filters.min_price,
      max_price: filters.max_price,
      guests: filters.guests,
      bedrooms: filters.bedrooms,
    },
    { auth: false }
  );
}

export async function getProperty(id: number | string) {
  return apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
}

export async function checkAvailability(
  propertyId: number | string,
  checkIn: string,
  checkOut: string
) {
  return apiClient.get<ApiResponse<AvailabilityResult>>(
    `/properties/${propertyId}/availability`,
    { checkIn, checkOut },
    { auth: false }
  );
}

export async function listMyProperties() {
  return apiClient.get<ApiResponse<PropertySummary[]>>('/properties/my');
}

export async function createProperty(payload: CreatePropertyPayload) {
  return apiClient.post<ApiResponse<Property>>('/properties', payload);
}

export async function updateProperty(
  id: number | string,
  payload: UpdatePropertyPayload
) {
  return apiClient.put<ApiResponse<Property>>(`/properties/${id}`, payload);
}

export async function deactivateProperty(id: number | string) {
  return apiClient.delete<ApiResponse<Property>>(`/properties/${id}`);
}

export async function updatePropertyStatus(
  id: number | string,
  is_active: boolean
) {
  return apiClient.patch<ApiResponse<Property>>(`/properties/${id}/status`, {
    is_active,
  });
}

export async function listPropertyImages(propertyId: number | string) {
  return apiClient.get<ApiResponse<PropertyImage[]>>(
    `/properties/${propertyId}/images`,
    undefined,
    { auth: false }
  );
}

export async function addPropertyImage(
  propertyId: number | string,
  payload: AddImagePayload
) {
  return apiClient.post<ApiResponse<PropertyImage>>(
    `/properties/${propertyId}/images`,
    payload
  );
}

export async function updatePropertyImage(
  propertyId: number | string,
  imageId: number | string,
  payload: AddImagePayload
) {
  return apiClient.put<ApiResponse<PropertyImage>>(
    `/properties/${propertyId}/images/${imageId}`,
    payload
  );
}

export async function deletePropertyImage(
  propertyId: number | string,
  imageId: number | string
) {
  return apiClient.delete<ApiResponse<PropertyImage>>(
    `/properties/${propertyId}/images/${imageId}`
  );
}
