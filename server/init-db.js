import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pool, query } from './db.js';

try {
  const schema = await readFile(resolve('database/schema.sql'), 'utf8');
  await query(schema);
  console.log('Database schema applied successfully.');
} finally {
  await pool.end();
}
