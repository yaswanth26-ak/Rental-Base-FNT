import { ApiError } from '@api/apiClient';
import * as propertiesApi from '@api/propertiesApi';
import type { Property } from '@/types';

/**
 * Resolve the single rental house for the customer experience.
 * Prefer VITE_PROPERTY_ID when set; otherwise use the first active property
 * returned by GET /api/properties, then load full details.
 */
export async function fetchFixedProperty(): Promise<Property> {
  const configuredId = import.meta.env.VITE_PROPERTY_ID?.trim();

  if (configuredId) {
    const response = await propertiesApi.getProperty(configuredId);
    if (!response.data) {
      throw new ApiError(response.message || 'Property not found', 404);
    }
    return response.data;
  }

  const listResponse = await propertiesApi.listProperties();
  const summaries = listResponse.data ?? [];

  if (summaries.length === 0) {
    throw new ApiError('No rental house is available yet', 404);
  }

  const propertyId = summaries[0].id;
  const detailResponse = await propertiesApi.getProperty(propertyId);

  if (!detailResponse.data) {
    throw new ApiError(
      detailResponse.message || 'Unable to load the rental house',
      404
    );
  }

  return detailResponse.data;
}
