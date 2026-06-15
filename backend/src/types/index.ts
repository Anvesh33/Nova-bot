export interface Conversation {
  id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface PostMessageBody {
  message: string;
  sessionId?: string;
}

export interface PostMessageResponse {
  reply: string;
  sessionId: string;
}

export interface GetHistoryResponse {
  sessionId: string;
  messages: Message[];
}
