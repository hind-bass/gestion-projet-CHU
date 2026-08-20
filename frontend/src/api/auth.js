import api from '../lib/api';

export async function login(email, motDePasse) {
  const { data } = await api.post('/auth/login', { email, motDePasse });
  return data;
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function refresh(refreshToken) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
}

export async function logout(refreshToken) {
  const { data } = await api.post('/auth/logout', { refreshToken });
  return data;
}
