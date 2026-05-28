import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fitzone-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

function getCookie(name: string) {
  if (typeof document === 'undefined') {
    return '';
  }

  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split('=')[1]) : '';
}

api.interceptors.request.use((config) => {
  if (globalThis.window) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

function redirectToLogin(message: string) {
  if (!globalThis.window) {
    return;
  }

  sessionStorage.setItem('auth-expired-message', message);
  toast.error(message);
  const params = new URLSearchParams({ reason: 'session-expired' });
  globalThis.window.location.replace(`/login?${params.toString()}`);
}

api.interceptors.response.use(
  (response) => {
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken && typeof document !== 'undefined') {
      document.cookie = `csrfToken=${newCsrfToken}; path=/; Secure; SameSite=None`;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh') {
        localStorage.removeItem('accessToken');
        redirectToLogin('Sua sessão expirou. Faça login novamente para continuar.');
        throw error;
      }

      originalRequest._retry = true;

      refreshPromise ??= api
        .post('/auth/refresh')
        .then((response) => {
          const token = response.data.accessToken as string;
          localStorage.setItem('accessToken', token);
          return token;
        })
        .finally(() => {
          refreshPromise = null;
        });

      try {
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        redirectToLogin('Sua sessão expirou. Faça login novamente para continuar.');

        throw error;
      }
    }

    throw error;
  }
);

export default api;
