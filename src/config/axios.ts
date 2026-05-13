import axios from 'axios';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'API-KEY',
    ...(env.X_API_KEY && { 'x-api-key': env.X_API_KEY }),
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
