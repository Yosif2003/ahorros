import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Interceptar error 401 (Token expirado o inválido)
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    
    // Evitamos redirecciones en bucle si ya estamos en el login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    
    throw new Error('Sesión expirada');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data as T;
};