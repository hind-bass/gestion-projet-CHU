export const IA_BASE_URL = import.meta.env.VITE_IA_URL || 'http://localhost:8000';

export async function iaChat({ userId, role, question }) {
  const response = await fetch(`${IA_BASE_URL}/api/ai/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId ? Number(userId) : 1,
      role: role === 'ADMIN' ? 'ADMIN' : 'MEMBRE',
      question,
    }),
  });
  if (!response.ok) {
    throw new Error(`Erreur serveur IA (${response.status})`);
  }
  return response.json();
}

export async function iaProcessTranscript(transcription) {
  const response = await fetch(`${IA_BASE_URL}/api/ai/meetings/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcription }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur FastAPI (${response.status})`);
  }
  return response.json();
}
