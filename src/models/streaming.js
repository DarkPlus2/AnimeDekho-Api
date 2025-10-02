const pool = require('../config/db');

async function saveStream(stream) {
  const { episodeId, server, url, quality } = stream;
  const query = `
    INSERT INTO streaming (episode_id, server, url, quality, scraped_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (url)
    DO UPDATE SET server=EXCLUDED.server, quality=EXCLUDED.quality, scraped_at=NOW()
    RETURNING id
  `;
  const res = await pool.query(query, [episodeId, server, url, quality]);
  return res.rows[0].id;
}

async function getStreamsByEpisode(episodeId) {
  const res = await pool.query(
    `SELECT * FROM streaming WHERE episode_id=$1 ORDER BY scraped_at DESC`,
    [episodeId]
  );
  return res.rows;
}

module.exports = { saveStream, getStreamsByEpisode };
