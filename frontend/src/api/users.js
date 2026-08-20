import api from '../lib/api';

export async function listUsers() {
  const { data } = await api.get('/users');
  return data;
}

export async function getMyProfile() {
  const { data } = await api.get('/users/me');
  return data;
}

export async function updateMyProfile({ nom, prenom, competences }) {
  const { data } = await api.put('/users/me', { nom, prenom, competences });
  return data;
}

export async function changeMyPassword({ motDePasseActuel, nouveauMotDePasse }) {
  const { data } = await api.post('/users/me/change-password', { motDePasseActuel, nouveauMotDePasse });
  return data;
}

export async function createUser(payload) {
  const { data } = await api.post('/users', payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function activateUser(id) {
  const { data } = await api.patch(`/users/${id}/activate`);
  return data;
}

export async function deactivateUser(id) {
  const { data } = await api.patch(`/users/${id}/deactivate`);
  return data;
}
