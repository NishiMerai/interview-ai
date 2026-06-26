import axios from 'axios';
import { store } from '../store/store.js';
import { setCredentials, logout } from '../features/auth/authSlice.js';

const envApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiBaseURL = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh-token');
        store.dispatch(setCredentials(data));
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        store.dispatch(logout());
      }
    }

    // Check if the backend is asleep or spinning up on Render.
    // This manifests as no response (network error), a gateway error (502, 503, 504), or a request timeout.
    if (!error.response || (error.response.status >= 502 && error.response.status <= 504) || error.code === 'ECONNABORTED') {
      const wakingUpMsg = "Server is waking up. Please try again in a few seconds.";
      if (error.response) {
        if (!error.response.data) error.response.data = {};
        error.response.data.message = wakingUpMsg;
      } else {
        error.response = {
          status: 503,
          data: {
            message: wakingUpMsg
          }
        };
      }
    }

    return Promise.reject(error);
  }
);
