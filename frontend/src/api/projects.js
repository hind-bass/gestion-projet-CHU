import api from '../lib/api';

export async function listProjects() {
  const { data } = await api.get('/projects');
  return data;
}

export async function listMyProjects() {
  const { data } = await api.get('/projects/mine');
  return data;
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function createProject(payload) {
  const { data } = await api.post('/projects', payload);
  return data;
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data;
}

export async function archiveProject(id) {
  const { data } = await api.patch(`/projects/${id}/archive`);
  return data;
}

export async function addProjectMember(projectId, userId) {
  const { data } = await api.post(`/projects/${projectId}/members`, { userId });
  return data;
}

export async function removeProjectMember(projectId, userId) {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
  return data;
}
