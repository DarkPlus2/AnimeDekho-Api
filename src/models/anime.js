const pool = require('../config/db');

async function saveAnime(anime) {
  const { title, link, image, synopsis } = anime;
  const query = `
    INSERT INTO anime (title, link, image, synopsis, scraped_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (link)
    DO UPDATE SET title=EXCLUDED.title, image=EXCLUDED.image, synopsis=EXCLUDED.synopsis, scraped_at=NOW()
    RETURNING id
  `;
  const res = await pool.query(query, [title, link, image, synopsis]);
  return res.rows[0].id;
}

async function getAllAnime(limit = 50) {
  const res = await pool.query(
    `SELECT * FROM anime ORDER BY scraped_at DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

async function getAnimeById(id) {
  const res = await pool.query(`SELECT * FROM anime WHERE id=$1`, [id]);
  return res.rows[0];
}

module.exports = { saveAnime, getAllAnime, getAnimeById };
