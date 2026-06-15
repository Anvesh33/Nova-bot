import styles from '../styles/chat.module.css';

export default function TypingIndicator() {
  return (
    <div className={`${styles.bubble} ${styles['bubble--ai']} ${styles['bubble--typing']}`}>
      <span className={styles['typing-dot']} />
      <span className={styles['typing-dot']} />
      <span className={styles['typing-dot']} />
    </div>
  );
}
