'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('./index');

/**
 * Seed initial discounts for development/testing.
 */
async function seed() {
  const now = new Date();
  const vf = new Date(now.getTime() - 24 * 3600 * 1000); // yesterday
  const vt = new Date(now.getTime() + 30 * 24 * 3600 * 1000); // in 30 days

  const entries = [
    {
      id: uuidv4(),
      code: 'WELCOME10',
      type: 'percentage',
      value: 10.0,
      description: '10% off for new users',
      valid_from: vf.toISOString(),
      valid_to: vt.toISOString(),
      is_active: true,
    },
    {
      id: uuidv4(),
      code: 'FLAT50',
      type: 'fixed',
      value: 50.0,
      description: 'Flat 50 off on orders above 500',
      valid_from: vf.toISOString(),
      valid_to: vt.toISOString(),
      is_active: true,
    },
    {
      id: uuidv4(),
      code: 'BOGO-APPLE',
      type: 'bogo',
      value: 0.0,
      description: 'Buy one get one on apples',
      valid_from: vf.toISOString(),
      valid_to: vt.toISOString(),
      is_active: true,
    },
  ];

  try {
    await db.query('BEGIN');
    for (const e of entries) {
      await db.query(
        `INSERT INTO discounts (id, code, type, value, description, valid_from, valid_to, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (code) DO NOTHING`,
        [e.id, e.code, e.type, e.value, e.description, e.valid_from, e.valid_to, e.is_active]
      );
    }
    await db.query('COMMIT');
    console.log('Seed completed.');
    process.exit(0);
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
