import { DatabaseSync } from 'node:sqlite';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DB_PATH || './data/chat.db';
const dir = path.dirname(path.resolve(dbPath));
fs.mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

const migrationPath = path.join(__dirname, 'migrations', '001_init.sql');
const migration = fs.readFileSync(migrationPath, 'utf-8');
db.exec(migration);

export default db;
