import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_PATH || './data/chat.db';
const dir = path.dirname(path.resolve(process.cwd(), dbPath));
mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id         TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT NOT NULL PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender          TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
    text            TEXT NOT NULL,
    timestamp       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON messages(conversation_id);
`);

export default db;
