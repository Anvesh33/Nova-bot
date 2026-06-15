import db from '../db/index';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types/index';

const insertMsg = db.prepare(
  'INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)'
);

const findById = db.prepare('SELECT * FROM messages WHERE id = ?');

const findByConversation = db.prepare(
  'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC'
);

const findByConversationLimited = db.prepare(
  'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ?'
);

const findRecentDesc = db.prepare(
  'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 10'
);

export function saveMessage(
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Message {
  const id = uuidv4();
  insertMsg.run(id, conversationId, sender, text);
  return findById.get(id) as unknown as Message;
}

export function getMessagesByConversation(
  conversationId: string,
  limit?: number
): Message[] {
  if (limit !== undefined) {
    return findByConversationLimited.all(conversationId, limit) as unknown as Message[];
  }
  return findByConversation.all(conversationId) as unknown as Message[];
}

export function getRecentMessagesForLLM(conversationId: string): Message[] {
  return (findRecentDesc.all(conversationId) as unknown as Message[]).reverse();
}
