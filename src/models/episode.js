const pool = require('../config/db');

async function saveEpisode(episode) {
  const { animeId, title, link, episode_number } = episode;
  const query = `
    INSERT INTO episode (anime_id, title, link, episode_number, scraped_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (link)
    DO UPDATE SET title=EXCLUDED.title, episode_number=EXCLUDED.episode_number, scraped_at=NOW()
    RETURNING id
  `;
  const res = await pool.query(query, [animeId, title, link, episode_number]);
  return res.rows[0].id;
}

async function getEpisodesByAnime(animeId) {
  const res = await pool.query(
    `SELECT * FROM episode WHERE anime_id=$1 ORDER BY scraped_at DESC`,
    [animeId]
  );
  return res.rows;
}

async function getEpisodeById(id) {
  const res = await pool.query(`SELECT * FROM episode WHERE id=$1`, [id]);
  return res.rows[0];
}

module.exports = { saveEpisode, getEpisodesByAnime, getEpisodeById };
