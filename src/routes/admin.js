const express = require('express');
const router = express.Router();
const { scrapeAnime } = require('../scraper');

const ADMIN_KEY = process.env.ADMIN_KEY || "secret";

// Auth middleware
function checkAuth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });
  next();
}

router.post('/scrape', checkAuth, async (req, res) => {
  await scrapeAnime();
  res.json({ message: "Scrape completed manually" });
});

module.exports = router;
