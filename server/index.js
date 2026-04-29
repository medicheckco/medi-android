import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './db.js';
import { batchToClient, medicationToClient, msToDate } from './mappers.js';
import { registerUser, requireAdmin, requireAuth, toClientUser } from './auth.js';

const app = express();
const port = Number(process.env.API_PORT || 4000);
const __dirname = dirname(fileURLToPath(import.meta.url));
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
}));
app.use(express.json({ limit: '25mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'MediTrack API',
    ok: true,
    health: '/api/health',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', registerUser);

app.post('/api/auth/login', requireAuth, (req, res) => {
  res.json({ user: toClientUser(req.user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(toClientUser(req.user));
});

app.get('/api/medications', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      'select * from medications where user_id = $1 and is_deleted = false order by lower(name)',
      [req.user.id]
    );
    res.json(result.rows.map(medicationToClient));
  } catch (error) {
    next(error);
  }
});

app.post('/api/medications', requireAuth, async (req, res, next) => {
  try {
    const med = req.body;
    const result = await query(
      `
        insert into medications
          (id, user_id, name, barcode, item_code, brand_name, supplier_name, category, gtin, updated_at_ms)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning id
      `,
      [
        med.id,
        req.user.id,
        med.name,
        med.barcode || '',
        med.itemCode || '',
        med.brandName || '',
        med.supplierName || '',
        med.category || '',
        med.gtin || '',
        med.updatedAt || Date.now(),
      ]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

app.put('/api/medications/:id', requireAuth, async (req, res, next) => {
  try {
    const med = req.body;
    const result = await query(
      `
        update medications set
          name = $3,
          barcode = $4,
          item_code = $5,
          brand_name = $6,
          supplier_name = $7,
          category = $8,
          gtin = $9,
          updated_at_ms = $10,
          is_deleted = coalesce($11, false)
        where id = $1 and user_id = $2
      `,
      [
        req.params.id,
        req.user.id,
        med.name,
        med.barcode || '',
        med.itemCode || '',
        med.brandName || '',
        med.supplierName || '',
        med.category || '',
        med.gtin || '',
        med.updatedAt || Date.now(),
        Boolean(med.isDeleted),
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Medication not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete('/api/medications/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      'update medications set is_deleted = true where id = $1 and user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Medication not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/batches', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      'select * from batches where user_id = $1 and is_deleted = false order by expiry_date',
      [req.user.id]
    );
    res.json(result.rows.map(batchToClient));
  } catch (error) {
    next(error);
  }
});

app.post('/api/batches', requireAuth, async (req, res, next) => {
  try {
    const batch = req.body;
    const expiryDate = msToDate(batch.expiryDate);
    if (!expiryDate) return res.status(400).json({ error: 'Invalid expiry date.' });

    const result = await query(
      `
        insert into batches
          (id, user_id, medication_id, batch_number, expiry_date, expiry_date_ms, quantity, status, created_at_ms, updated_at_ms)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning id
      `,
      [
        batch.id,
        req.user.id,
        batch.medicationId,
        batch.batchNumber,
        expiryDate,
        batch.expiryDate,
        batch.quantity,
        batch.status || 'active',
        batch.createdAt || Date.now(),
        batch.updatedAt || Date.now(),
      ]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

app.put('/api/batches/:id', requireAuth, async (req, res, next) => {
  try {
    const batch = req.body;
    const expiryDate = msToDate(batch.expiryDate);
    if (!expiryDate) return res.status(400).json({ error: 'Invalid expiry date.' });

    const result = await query(
      `
        update batches set
          medication_id = $3,
          batch_number = $4,
          expiry_date = $5,
          expiry_date_ms = $6,
          quantity = $7,
          status = $8,
          updated_at_ms = $9,
          is_deleted = coalesce($10, false)
        where id = $1 and user_id = $2
      `,
      [
        req.params.id,
        req.user.id,
        batch.medicationId,
        batch.batchNumber,
        expiryDate,
        batch.expiryDate,
        batch.quantity,
        batch.status || 'active',
        batch.updatedAt || Date.now(),
        Boolean(batch.isDeleted),
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Batch not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete('/api/batches/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      'update batches set is_deleted = true where id = $1 and user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Batch not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete('/api/clear', requireAuth, async (req, res, next) => {
  try {
    await query('delete from batches where user_id = $1', [req.user.id]);
    await query('delete from medications where user_id = $1', [req.user.id]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/bulk-import', requireAuth, async (req, res, next) => {
  try {
    const { medications = [], batches = [] } = req.body;

    for (const med of medications) {
      await query(
        `
          insert into medications
            (id, user_id, name, barcode, item_code, brand_name, supplier_name, category, gtin, updated_at_ms)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          on conflict (id) do update set
            name = excluded.name,
            barcode = excluded.barcode,
            item_code = excluded.item_code,
            brand_name = excluded.brand_name,
            supplier_name = excluded.supplier_name,
            category = excluded.category,
            gtin = excluded.gtin,
            updated_at_ms = excluded.updated_at_ms,
            is_deleted = false
        `,
        [
          med.id,
          req.user.id,
          med.name,
          med.barcode || '',
          med.itemCode || '',
          med.brandName || '',
          med.supplierName || '',
          med.category || '',
          med.gtin || '',
          med.updatedAt || Date.now(),
        ]
      );
    }

    for (const batch of batches) {
      const expiryDate = msToDate(batch.expiryDate);
      if (!expiryDate) continue;

      await query(
        `
          insert into batches
            (id, user_id, medication_id, batch_number, expiry_date, expiry_date_ms, quantity, status, created_at_ms, updated_at_ms)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          on conflict (id) do update set
            medication_id = excluded.medication_id,
            batch_number = excluded.batch_number,
            expiry_date = excluded.expiry_date,
            expiry_date_ms = excluded.expiry_date_ms,
            quantity = excluded.quantity,
            status = excluded.status,
            updated_at_ms = excluded.updated_at_ms,
            is_deleted = false
        `,
        [
          batch.id,
          req.user.id,
          batch.medicationId,
          batch.batchNumber,
          expiryDate,
          batch.expiryDate,
          batch.quantity,
          batch.status || 'active',
          batch.createdAt || Date.now(),
          batch.updatedAt || Date.now(),
        ]
      );
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/stats', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [usersResult, totalsResult] = await Promise.all([
      query('select * from admin_user_stats order by medication_count desc, email asc'),
      query('select * from admin_totals'),
    ]);

    res.json({
      users: usersResult.rows.map((row) => ({
        uid: row.uid,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        medicationCount: Number(row.medication_count),
        batchCount: Number(row.batch_count),
        geminiScanCount: Number(row.gemini_scan_count),
        gs1ScanCount: Number(row.gs1_scan_count),
        lastLogin: row.last_login,
      })),
      totals: {
        medications: Number(totalsResult.rows[0]?.medications || 0),
        batches: Number(totalsResult.rows[0]?.batches || 0),
        aiScans: Number(totalsResult.rows[0]?.ai_scans || 0),
        gs1Scans: Number(totalsResult.rows[0]?.gs1_scans || 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/db/init', async (req, res, next) => {
  try {
    if (process.env.ALLOW_DB_INIT !== 'true') {
      return res.status(403).json({ error: 'Database initialization is disabled.' });
    }

    const schema = await readFile(resolve(__dirname, '../database/schema.sql'), 'utf8');
    await query(schema);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Duplicate record.' });
  }
  if (error.code === '23503') {
    return res.status(400).json({ error: 'Related record not found.' });
  }
  res.status(500).json({ error: error.message || 'Server error.' });
});

app.listen(port, () => {
  console.log(`MediTrack API listening on http://localhost:${port}`);
});
