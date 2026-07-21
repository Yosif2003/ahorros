import { apiFetch } from '../../services/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Añade este método a tu authService existente
async updateUsername(name: string): Promise<User> {
    // Usamos tu helper apiFetch que ya maneja la URL base y el token automáticamente
    const data = await apiFetch<{ message: string; user: User }>('/users/profile/username', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });

    // Actualizamos la sesión guardada en localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, name: data.user.name };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return updatedUser;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return await apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    return await apiFetch<{ message: string }>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};