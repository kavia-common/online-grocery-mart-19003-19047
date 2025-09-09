const app = require('./app');
const { query } = require('./db');
const { runMigrations } = require('./db/migrate');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function ensureMigrated() {
  try {
    await query('SELECT 1 FROM discounts LIMIT 1');
  } catch (e) {
    console.log('Running initial migration...');
    await runMigrations();
  }
}

(async () => {
  await ensureMigrated();

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
})();
