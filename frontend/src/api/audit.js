import api from '../lib/api';

export async function listAuditLogs({ page = 0, size = 50 } = {}) {
  const { data } = await api.get('/audit-logs', { params: { page, size, sort: 'dateAction,desc' } });
  return data;
}
