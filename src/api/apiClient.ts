import { clearAuthStorage, getStoredToken } from '@utils/storage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  success: false;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.success = false;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  skipAuthRedirect?: boolean;
};

function buildUrl(path: string, query?: Record<string, string | number | undefined | null>) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalized}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

let handlingUnauthorized = false;

function handleUnauthorized(skipAuthRedirect?: boolean) {
  clearAuthStorage();
  if (skipAuthRedirect || handlingUnauthorized) return;
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login' || window.location.pathname === '/register') {
    return;
  }
  handlingUnauthorized = true;
  window.location.assign('/login');
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  query?: Record<string, string | number | undefined | null>
): Promise<T> {
  const { body, auth = true, skipAuthRedirect, headers, ...rest } = options;
  const token = getStoredToken();

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type') && body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (auth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseBody(response);

  if (response.status === 401) {
    handleUnauthorized(skipAuthRedirect);
    throw new ApiError(extractMessage(payload, 'Unauthorized'), 401);
  }

  if (!response.ok) {
    throw new ApiError(
      extractMessage(payload, `Request failed (${response.status})`),
      response.status
    );
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(
    path: string,
    query?: Record<string, string | number | undefined | null>,
    options?: RequestOptions
  ) => apiRequest<T>(path, { ...options, method: 'GET' }, query),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
