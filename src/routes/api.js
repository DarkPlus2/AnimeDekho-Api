const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get anime list
router.get('/anime', async (req, res) => {
  const data = await pool.query('SELECT * FROM anime ORDER BY scraped_at DESC LIMIT 50');
  res.json(data.rows);
});

// Get anime details
router.get('/anime/:id', async (req, res) => {
  const data = await pool.query('SELECT * FROM anime WHERE id=$1', [req.params.id]);
  res.json(data.rows[0]);
});

// Get episodes by anime
router.get('/anime/:id/episodes', async (req, res) => {
  const data = await pool.query('SELECT * FROM episode WHERE anime_id=$1 ORDER BY scraped_at DESC', [req.params.id]);
  res.json(data.rows);
});

// Get streams by episode
router.get('/episode/:id/streams', async (req, res) => {
  const data = await pool.query('SELECT * FROM streaming WHERE episode_id=$1', [req.params.id]);
  res.json(data.rows);
});

module.exports = router;
