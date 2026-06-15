import { useReducer, useEffect, useCallback } from 'react';
import { Message } from '../types/index';
import * as chatApi from '../api/chatApi';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

type ChatAction =
  | { type: 'LOAD_HISTORY'; payload: { messages: Message[]; sessionId: string } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'LOAD_HISTORY':
      return {
        ...state,
        messages: action.payload.messages,
        sessionId: action.payload.sessionId,
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
  }
}

const SESSION_KEY = 'nova_session_id';

export default function useChat() {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return;

    chatApi
      .fetchHistory(stored)
      .then((data) => {
        dispatch({ type: 'LOAD_HISTORY', payload: { messages: data.messages, sessionId: data.sessionId } });
      })
      .catch(() => {
        // stale session — silently ignore
      });
  }, []);

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (state.isLoading) return;

      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'SET_LOADING', payload: true });

      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: state.sessionId ?? '',
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: optimisticMsg });

      try {
        const data = await chatApi.sendMessage(text, state.sessionId ?? undefined);

        localStorage.setItem(SESSION_KEY, data.sessionId);

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          conversation_id: data.sessionId,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMsg });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        dispatch({ type: 'SET_ERROR', payload: message });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.isLoading, state.sessionId]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sessionId: state.sessionId,
    sendMessage,
  };
}
