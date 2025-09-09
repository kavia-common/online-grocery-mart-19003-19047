'use strict';

const { Pool } = require('pg');
const fs = require('fs');

function getBoolEnv(name, defaultVal = false) {
  const v = process.env[name];
  if (typeof v === 'undefined') return defaultVal;
  return ['true', '1', 'yes'].includes(String(v).toLowerCase());
}

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'discounts_db',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  ssl: getBoolEnv('PG_SSL', false) ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Get a client from pool with automatic error logging.
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function close() {
  await pool.end();
}

module.exports = {
  pool,
  getClient,
  query,
  close,
};
