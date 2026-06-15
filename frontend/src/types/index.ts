export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface GetHistoryResponse {
  sessionId: string;
  messages: Message[];
}
