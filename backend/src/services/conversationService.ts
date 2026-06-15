import db from '../db/index';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../types/index';

const findById = db.prepare('SELECT * FROM conversations WHERE id = ?');
const insert = db.prepare('INSERT INTO conversations (id) VALUES (?)');

export function getOrCreateConversation(sessionId?: string): Conversation {
  if (sessionId && sessionId.trim() !== '') {
    const existing = findById.get(sessionId) as unknown as Conversation | undefined;
    if (existing) return existing;
  }

  const id = uuidv4();
  insert.run(id);
  return findById.get(id) as unknown as Conversation;
}

export function getConversationById(id: string): Conversation | undefined {
  return findById.get(id) as unknown as Conversation | undefined;
}
