import axios from 'axios';
import { clearSession, getAccessToken, getRefreshToken, saveTokens, setStoredUser } from './storage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Permet à l'AuthContext de réagir à une session définitivement expirée.
let onSessionExpired = null;
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error('Aucun jeton de rafraichissement'));

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        if (data.user) setStoredUser(data.user);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const isRefreshCall = config?.url?.includes('/auth/refresh');
    const isLoginCall = config?.url?.includes('/auth/login');

    if (response?.status === 401 && config && !config._retried && !isRefreshCall && !isLoginCall) {
      config._retried = true;
      try {
        const accessToken = await refreshAccessToken();
        config.headers = { ...config.headers, Authorization: `Bearer ${accessToken}` };
        return api(config);
      } catch (refreshError) {
        clearSession();
        if (onSessionExpired) onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error, fallback = 'Une erreur est survenue.') {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 502 || status === 503 || status === 504) {
    return 'Le serveur applicatif est indisponible. Réessayez dans quelques secondes.';
  }
  if (!data) {
    return error?.message === 'Network Error'
      ? 'Serveur injoignable. Vérifiez que le backend est démarré sur le port 3000.'
      : fallback;
  }
  if (typeof data === 'string') {
    if (data.includes('<html') || data.includes('502') || data.includes('Bad Gateway')) {
      return 'Le serveur applicatif est indisponible. Réessayez dans quelques secondes.';
    }
    return data;
  }
  if (Array.isArray(data.details) && data.details.length > 0) return data.details.join(' • ');
  return data.message || fallback;
}

export default api;
