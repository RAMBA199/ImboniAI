import axios from 'axios';

let API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://imboniai.onrender.com' : '');

// Normalize API_URL to not end with /api
if (API_URL.endsWith('/api')) {
  API_URL = API_URL.slice(0, -4);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchPlaces(params?: {
  category?: string;
  lat?: number;
  lon?: number;
  search?: string;
  limit?: number;
}) {
  // Add cache-busting timestamp to ensure fresh data on every call
  const paramsWithCacheBust = {
    ...params,
    _t: Date.now(), // Cache buster
  };
  const { data } = await api.get('/api/places', { params: paramsWithCacheBust });
  return data; // Return { places, total, message }
}

export async function sendChatMessage(payload: {
  message: string;
  session_id: string;
  language?: string;
  user_preferences?: string[];
  simple_mode?: boolean;
  user_lat?: number;
  user_lon?: number;
}) {
  const { data } = await api.post('/api/chat', payload);
  return data;
}

export async function transcribeVoice(audioData: string, mimeType: string, language: string = 'en') {
  const { data } = await api.post('/api/voice', { audio_data: audioData, mime_type: mimeType, language });
  return data;
}

export async function savePreferences(prefs: {
  user_id: string;
  interests: string[];
  language: string;
  simple_mode: boolean;
}) {
  const { data } = await api.post('/api/preferences', prefs);
  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await api.post('/api/auth/login', payload);
  return data;
}

export async function registerUser(payload: {
  name: string;
  username: string;
  email: string;
  password: string;
  profilePic?: string;
}) {
  const { data } = await api.post('/api/auth/register', payload);
  return data;
}

export async function fetchUserProfile(userId: string) {
  const { data } = await api.get('/api/auth/profile', { params: { userId } });
  return data;
}

export async function updateUserProfile(payload: {
  userId: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  profilePic?: string;
}) {
  const { data } = await api.put('/api/auth/profile', payload);
  return data;
}

export async function deleteUserAccount(payload: { userId: string }) {
  const { data } = await api.delete('/api/auth/profile', { data: payload });
  return data;
}

export async function registerBusiness(payload: {
  name: string;
  address: string;
  businessType: string;
  businessFeel: string;
  menus: string;
  plan: string;
}) {
  const { data } = await api.post('/api/businesses/register', payload);
  return data;
}

export async function fetchHiddenGems(params?: {
  search?: string;
  lat?: number;
  lon?: number;
  limit?: number;
}) {
  const { data } = await api.get('/api/businesses/hidden', {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  return data;
}

export async function logoutUser() {
  const { data } = await api.post('/api/auth/logout');
  return data;
}
