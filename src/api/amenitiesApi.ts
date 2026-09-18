import { apiClient } from '@api/apiClient';
import type { Amenity, ApiResponse } from '@/types';

export async function listAmenities() {
  return apiClient.get<ApiResponse<Amenity[]>>('/amenities', undefined, {
    auth: false,
  });
}

export async function getPropertyAmenities(propertyId: number | string) {
  return apiClient.get<ApiResponse<Amenity[]>>(
    `/properties/${propertyId}/amenities`,
    undefined,
    { auth: false }
  );
}

export async function replacePropertyAmenities(
  propertyId: number | string,
  amenity_ids: number[]
) {
  return apiClient.put<ApiResponse<Amenity[]>>(
    `/properties/${propertyId}/amenities`,
    { amenity_ids }
  );
}
