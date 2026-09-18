import { apiClient } from '@api/apiClient';
import type {
  ApiResponse,
  AuthPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types';

export async function register(payload: RegisterPayload) {
  return apiClient.post<ApiResponse<AuthPayload>>('/auth/register', payload, {
    auth: false,
    skipAuthRedirect: true,
  });
}

export async function login(payload: LoginPayload) {
  return apiClient.post<ApiResponse<AuthPayload>>('/auth/login', payload, {
    auth: false,
    skipAuthRedirect: true,
  });
}

export async function getMe() {
  return apiClient.get<ApiResponse<User>>('/auth/me', undefined, {
    skipAuthRedirect: true,
  });
}
