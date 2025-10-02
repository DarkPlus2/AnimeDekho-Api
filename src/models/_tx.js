// src/models/_tx.js
const pool = require('../config/db');

/**
 * Run a function inside a transaction. Returns the function result.
 * Usage:
 *   await withTransaction(async (client) => {
 *     await client.query(...);
 *   });
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { withTransaction };
