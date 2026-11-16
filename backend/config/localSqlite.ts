import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

let db: DatabaseSync | null = null;

export function getLocalInboxDb(): DatabaseSync {
  if (db) return db;
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'bit_tech_connect_local.db');
  db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS student_submissions (
      id TEXT PRIMARY KEY,
      submission_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT '',
      submitter_name TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      department_or_year TEXT DEFAULT '',
      external_link TEXT DEFAULT '',
      tech_stack TEXT NOT NULL DEFAULT '[]',
      needed_roles TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL
    );
  `);

  return db;
}

export function insertLocalSubmission(payload: {
  submission_type: string;
  title: string;
  description: string;
  category: string;
  submitter_name: string;
  submitter_email: string;
  department_or_year: string;
  external_link: string;
  tech_stack: string[];
  needed_roles: string;
}) {
  const database = getLocalInboxDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO student_submissions (
      id, submission_type, title, description, category,
      submitter_name, submitter_email, department_or_year,
      external_link, tech_stack, needed_roles, status, is_published,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)
  `);
  stmt.run(
    id,
    payload.submission_type,
    payload.title,
    payload.description,
    payload.category,
    payload.submitter_name,
    payload.submitter_email,
    payload.department_or_year,
    payload.external_link,
    JSON.stringify(payload.tech_stack),
    payload.needed_roles,
    now,
    now,
  );
  return { id, status: 'pending', created_at: now };
}

export function insertLocalContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const database = getLocalInboxDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = database.prepare(`
    INSERT INTO contact_messages (id, name, email, subject, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'unread', ?)
  `);
  stmt.run(id, payload.name, payload.email, payload.subject, payload.message, now);
  return { id, status: 'unread', created_at: now };
}
