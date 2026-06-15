import { useState } from 'react';
import styles from '../styles/chat.module.css';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');

  function handleSend() {
    if (value.trim().length === 0 || value.length > 2000) return;
    onSend(value.trim());
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isOverLimit = value.length > 2000;
  const isSendDisabled = disabled || value.trim().length === 0 || isOverLimit;

  return (
    <div className={styles['message-input']}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        rows={1}
      />
      <div className={styles['input-footer']}>
        <span className={isOverLimit ? `${styles['char-count']} ${styles['char-count--over']}` : styles['char-count']}>
          {isOverLimit
            ? `Message too long — please shorten before sending. (${value.length} / 2000)`
            : `${value.length} / 2000`}
        </span>
        <button onClick={handleSend} disabled={isSendDisabled}>
          {disabled ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
