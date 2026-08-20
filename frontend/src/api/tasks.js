import api from '../lib/api';

export async function listTasks({ mine = false } = {}) {
  const { data } = await api.get('/tasks', { params: mine ? { mine: true } : {} });
  return data;
}

export async function listMyTasks() {
  return listTasks({ mine: true });
}

export async function getTask(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

export async function listProjectTasks(projectId) {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return data;
}

export async function createTask(payload) {
  const { data } = await api.post('/tasks', payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}

export async function updateTaskStatus(id, statut) {
  const { data } = await api.patch(`/tasks/${id}/status`, { statut });
  return data;
}

export async function assignTask(id, userId) {
  const { data } = await api.patch(`/tasks/${id}/assign/${userId}`);
  return data;
}

export async function getTaskHistory(id) {
  const { data } = await api.get(`/tasks/${id}/history`);
  return data;
}
