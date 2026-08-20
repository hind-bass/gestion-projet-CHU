import api from '../lib/api';

export async function listMeetings({ mine = false, projectId } = {}) {
  const params = {};
  if (mine) params.mine = true;
  if (projectId) params.projectId = projectId;
  const { data } = await api.get('/meetings', { params });
  return data;
}

export async function listMyMeetings() {
  const { data } = await api.get('/meetings/mine');
  return data;
}

export async function getMeeting(id) {
  const { data } = await api.get(`/meetings/${id}`);
  return data;
}

export async function createMeeting(payload) {
  const { data } = await api.post('/meetings', payload);
  return data;
}

export async function updateMeeting(id, payload) {
  const { data } = await api.put(`/meetings/${id}`, payload);
  return data;
}

export async function deleteMeeting(id) {
  await api.delete(`/meetings/${id}`);
}

export async function processMeeting(id) {
  const { data } = await api.post(`/meetings/${id}/process`);
  return data;
}
