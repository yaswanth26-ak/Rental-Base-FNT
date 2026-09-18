import { apiClient } from '@api/apiClient';
import type {
  ApiResponse,
  ChangePasswordPayload,
  UpdateProfilePayload,
  User,
} from '@/types';

export async function getProfile() {
  return apiClient.get<ApiResponse<User>>('/users/me');
}

export async function updateProfile(payload: UpdateProfilePayload) {
  return apiClient.put<ApiResponse<User>>('/users/me', payload);
}

export async function changePassword(payload: ChangePasswordPayload) {
  return apiClient.put<ApiResponse<undefined>>('/users/me/password', payload);
}
