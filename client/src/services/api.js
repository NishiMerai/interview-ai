import axios from 'axios';
import { store } from '../store/store.js';
import { setCredentials, logout } from '../features/auth/authSlice.js';

export const api = axios.create({
baseURL: "https://interview-ai-back-d6w7.onrender.com/api",
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

    return Promise.reject(error);
  }
);
