// src/models/anime.js
const pool = require('../config/db');
const { withTransaction } = require('./_tx');

/**
 * Upsert a single anime by link.
 * Returns the inserted/updated row.
 * @param {Object} anime { title, link, image, synopsis, scraped_at? }
 * @param {Object} [client] optional pg client (for transactions)
 */
async function upsertAnime(anime, client = null) {
  const useClient = client || pool;
  const sql = `
    INSERT INTO anime (title, link, image, synopsis, scraped_at)
    VALUES ($1, $2, $3, $4, COALESCE($5, NOW()))
    ON CONFLICT (link) DO UPDATE
      SET title = EXCLUDED.title,
          image = EXCLUDED.image,
          synopsis = EXCLUDED.synopsis,
          scraped_at = COALESCE(EXCLUDED.scraped_at, NOW())
    RETURNING *;
  `;
  const params = [
    anime.title || null,
    anime.link,
    anime.image || null,
    anime.synopsis || null,
    anime.scraped_at || null,
  ];
  const res = await useClient.query(sql, params);
  return res.rows[0];
}

/**
 * Bulk upsert an array of anime objects in a single transaction.
 * Returns array of upserted rows.
 * This iterates per item but uses one transaction for safety.
 */
async function bulkUpsertAnime(animeArray = []) {
  if (!Array.isArray(animeArray) || animeArray.length === 0) return [];

  return await withTransaction(async (client) => {
    const out = [];
    for (const a of animeArray) {
      const row = await upsertAnime(a, client);
      out.push(row);
    }
    return out;
  });
}

/**
 * Get anime by ID.
 */
async function getAnimeById(id) {
  const res = await pool.query('SELECT * FROM anime WHERE id = $1', [id]);
  return res.rows[0] || null;
}

/**
 * Get anime by link (exact).
 */
async function getAnimeByLink(link) {
  const res = await pool.query('SELECT * FROM anime WHERE link = $1', [link]);
  return res.rows[0] || null;
}

/**
 * Get anime with episodes (joins episodes and stream counts).
 * Returns { anime, episodes: [ { ... , streams_count } ] }
 */
async function getAnimeWithEpisodes(id) {
  const client = await pool.connect();
  try {
    const animeRes = await client.query('SELECT * FROM anime WHERE id = $1', [id]);
    const anime = animeRes.rows[0] || null;
    if (!anime) return null;

    const episodesRes = await client.query(
      `SELECT e.*, COALESCE(counts.streams_count,0) AS streams_count
       FROM episode e
       LEFT JOIN (
         SELECT episode_id, COUNT(*) AS streams_count
         FROM streaming
         GROUP BY episode_id
       ) counts ON counts.episode_id = e.id
       WHERE e.anime_id = $1
       ORDER BY e.scraped_at DESC, e.episode_number ASC`,
      [id]
    );

    return { anime, episodes: episodesRes.rows };
  } finally {
    client.release();
  }
}

/**
 * Paginated list of anime with optional text search.
 * options: { q, limit=20, offset=0, orderBy='scraped_at', orderDir='DESC' }
 */
async function listAnime(options = {}) {
  const { q, limit = 20, offset = 0, orderBy = 'scraped_at', orderDir = 'DESC' } = options;

  if (q && q.trim()) {
    // Full text search using plainto_tsquery
    const sql = `
      SELECT *,
        ts_rank_cd(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(synopsis,'')),
                   plainto_tsquery('english', $1)) AS rank
      FROM anime
      WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(synopsis,'')) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC, ${orderBy} ${orderDir}
      LIMIT $2 OFFSET $3
    `;
    const res = await pool.query(sql, [q, limit, offset]);
    return res.rows;
  } else {
    const sql = `SELECT * FROM anime ORDER BY ${orderBy} ${orderDir} LIMIT $1 OFFSET $2`;
    const res = await pool.query(sql, [limit, offset]);
    return res.rows;
  }
}

/**
 * Delete anime by id (cascades to episodes and streams via FK ON DELETE CASCADE).
 */
async function deleteAnimeById(id) {
  const res = await pool.query('DELETE FROM anime WHERE id = $1 RETURNING id', [id]);
  return res.rowCount > 0;
}

module.exports = {
  upsertAnime,
  bulkUpsertAnime,
  getAnimeById,
  getAnimeByLink,
  getAnimeWithEpisodes,
  listAnime,
  deleteAnimeById,
};
