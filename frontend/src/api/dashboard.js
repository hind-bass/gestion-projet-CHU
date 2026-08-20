import api from '../lib/api';

export async function getAdminStats() {
  const { data } = await api.get('/dashboard');
  return data;
}

export async function getMyStats() {
  const { data } = await api.get('/dashboard/me');
  return data;
}
