import { useRef, useEffect } from 'react';
import useChat from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import styles from '../styles/chat.module.css';

export default function ChatWindow() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={styles['chat-window']}>
      <header className={styles['chat-header']}>
        <div className={styles['chat-header__avatar']} />
        <div className={styles['chat-header__info']}>
          <span className={styles['chat-header__name']}>Nova Store Support</span>
          <span className={styles['chat-header__status']}>Online</span>
        </div>
      </header>

      <div className={styles['chat-messages']}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        {error && <div className={styles['chat-error']}>{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles['chat-input-area']}>
        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
