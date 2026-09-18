import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@api/authApi';
import { ApiError } from '@api/apiClient';
import type { LoginPayload, RegisterPayload, User } from '@/types';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '@utils/storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  setSession: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((nextUser: User, nextToken: string) => {
    setStoredUser(nextUser);
    setStoredToken(nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      logout();
      return null;
    }

    try {
      const response = await authApi.getMe();
      if (!response.data) {
        throw new ApiError(response.message || 'Unable to load user', 401);
      }
      setStoredUser(response.data);
      setUser(response.data);
      setToken(currentToken);
      return response.data;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (active) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        if (!active) return;
        if (response.data) {
          setStoredUser(response.data);
          setUser(response.data);
          setToken(storedToken);
        } else {
          clearAuthStorage();
          setUser(null);
          setToken(null);
        }
      } catch {
        if (!active) return;
        clearAuthStorage();
        setUser(null);
        setToken(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      if (!response.data?.user || !response.data?.token) {
        throw new ApiError(response.message || 'Login failed', 400);
      }
      setSession(response.data.user, response.data.token);
      return response.data.user;
    },
    [setSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      if (!response.data?.user || !response.data?.token) {
        throw new ApiError(response.message || 'Registration failed', 400);
      }
      setSession(response.data.user, response.data.token);
      return response.data.user;
    },
    [setSession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setSession,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
