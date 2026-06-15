import { SendMessageResponse, GetHistoryResponse } from '../types/index';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<SendMessageResponse> {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data.error ?? 'Failed to send message.');
    } catch {
      throw new Error('Failed to send message.');
    }
  }

  return res.json() as Promise<SendMessageResponse>;
}

export async function fetchHistory(sessionId: string): Promise<GetHistoryResponse> {
  const res = await fetch(`${BASE_URL}/chat/${sessionId}`);

  if (res.status === 404) {
    return { sessionId, messages: [] };
  }

  if (!res.ok) {
    throw new Error('Failed to load conversation history.');
  }

  return res.json() as Promise<GetHistoryResponse>;
}
