import api from '../lib/api';

export async function getKanban(projectId) {
  const { data } = await api.get(`/projects/${projectId}/kanban`);
  return data;
}
