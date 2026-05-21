import axios from 'axios';
import { API_URL, TEMP_TOKEN } from '../constants/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 120 saniye — Gemini analizi uzun sürebilir
});

// Her istekte TEMP_TOKEN'ı Authorization header'a ekle
api.interceptors.request.use((config) => {
  if (TEMP_TOKEN) {
    config.headers.Authorization = `Bearer ${TEMP_TOKEN}`;
  }
  // Bypass localtunnel splash screen
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

// --- Tasks ---
export const createTask = async (formData) => {
  const response = await api.post('/api/tasks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getTasks = async () => {
  const response = await api.get('/api/tasks');
  return response.data;
};

export const completeTask = async (taskId) => {
  const response = await api.patch(`/api/tasks/${taskId}/complete`);
  return response.data;
};

// --- Quiz ---
export const submitQuiz = async (taskId, answers) => {
  const response = await api.post(`/api/quiz/${taskId}/submit`, { answers });
  return response.data; // { score, passed, coinsEarned, animalStatus }
};

// --- Animal ---
export const getAnimal = async () => {
  const response = await api.get('/api/animal');
  return response.data; // { animal: { name, status, last_fed_at }, memorial: [] }
};

export const updateAnimalName = async (name) => {
  const response = await api.put('/api/animal/name', { name });
  return response.data;
};

export const feedAnimal = async () => {
  const response = await api.post('/api/animal/feed');
  return response.data; // { success, status, bonesRemaining }
};

export default api;
