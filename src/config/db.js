const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Example: postgres://user:pass@localhost:5432/animedekho
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

module.exports = pool;
