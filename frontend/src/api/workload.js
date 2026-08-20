import api from '../lib/api';

export async function getMyWorkload() {
  const { data } = await api.get('/workload/me');
  return data;
}
