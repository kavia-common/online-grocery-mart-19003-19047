'use strict';

/**
 * Runs initial database migrations for DiscountService.
 * Creates discounts and discount_applications tables.
 */
const db = require('./index');

async function runMigrations() {
  const createDiscounts = `
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage','fixed','bogo')),
  value NUMERIC(12,2) NOT NULL CHECK (value >= 0),
  description TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);`;

  const createApplications = `
CREATE TABLE IF NOT EXISTS discount_applications (
  id UUID PRIMARY KEY,
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  cart_id VARCHAR(100) NOT NULL,
  applied_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);`;

  const createUpdatedAtTrigger = [
    'CREATE OR REPLACE FUNCTION set_updated_at()',
    'RETURNS TRIGGER AS $$',
    'BEGIN',
    '  NEW.updated_at = NOW();',
    '  RETURN NEW;',
    'END;',
    '$$ LANGUAGE plpgsql;',
    '',
    'DO $$',
    'BEGIN',
    "  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_discounts_updated_at') THEN",
    '    CREATE TRIGGER set_discounts_updated_at',
    '    BEFORE UPDATE ON discounts',
    '    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();',
    '  END IF;',
    'END;',
    '$$;'
  ].join('\n');

  await db.query('BEGIN');
  try {
    await db.query(createDiscounts);
    await db.query(createApplications);
    await db.query(createUpdatedAtTrigger);
    await db.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', err);
    throw err;
  }
}

// If run directly via node, execute migrations.
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  runMigrations,
};
```

Explanation: Seed script for example discounts
````write file="online-grocery-mart-19003-19047/DiscountService/src/db/seed.js"
'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('./index');

async function seed() {
  const now = new Date();
  const vf = new Date(now.getTime() - 24 * 3600 * 1000); // yesterday
  const vt = new Date(now.getTime() + 30 * 24 * 3600 * 1000); // +30 days

  const data = [
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
    for (const d of data) {
      await db.query(
        `INSERT INTO discounts (id, code, type, value, description, valid_from, valid_to, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (code) DO NOTHING`,
        [d.id, d.code, d.type, d.value, d.description, d.valid_from, d.valid_to, d.is_active]
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
