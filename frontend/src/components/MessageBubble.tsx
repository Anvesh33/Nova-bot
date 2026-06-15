import { Message } from '../types/index';
import styles from '../styles/chat.module.css';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const time = new Date(message.timestamp);
  const formatted = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

  return (
    <div className={`${styles.bubble} ${message.sender === 'user' ? styles['bubble--user'] : styles['bubble--ai']}`}>
      <span className={styles['bubble__text']}>{message.text}</span>
      <span className={styles['bubble__time']}>{formatted}</span>
    </div>
  );
}
