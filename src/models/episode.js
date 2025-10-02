// src/models/episode.js
const pool = require('../config/db');
const { withTransaction } = require('./_tx');

/**
 * Upsert episode by link.
 * episode: { anime_id, title, link, episode_number, scraped_at? }
 */
async function upsertEpisode(episode, client = null) {
  const useClient = client || pool;
  const sql = `
    INSERT INTO episode (anime_id, title, link, episode_number, scraped_at)
    VALUES ($1, $2, $3, $4, COALESCE($5, NOW()))
    ON CONFLICT (link) DO UPDATE
      SET title = EXCLUDED.title,
          episode_number = EXCLUDED.episode_number,
          scraped_at = COALESCE(EXCLUDED.scraped_at, NOW())
    RETURNING *;
  `;
  const params = [
    episode.anime_id,
    episode.title || null,
    episode.link,
    episode.episode_number || null,
    episode.scraped_at || null,
  ];
  const res = await useClient.query(sql, params);
  return res.rows[0];
}

/**
 * Bulk upsert episodes (single transaction).
 * episodes: array of episode objects
 */
async function bulkUpsertEpisodes(episodes = []) {
  if (!Array.isArray(episodes) || episodes.length === 0) return [];
  return await withTransaction(async (client) => {
    const out = [];
    for (const ep of episodes) {
      const row = await upsertEpisode(ep, client);
      out.push(row);
    }
    return out;
  });
}

/**
 * List episodes by anime id with optional ordering and pagination
 */
async function listEpisodesByAnime(animeId, { limit = 100, offset = 0 } = {}) {
  const res = await pool.query(
    `SELECT * FROM episode WHERE anime_id = $1 ORDER BY scraped_at DESC LIMIT $2 OFFSET $3`,
    [animeId, limit, offset]
  );
  return res.rows;
}

/**
 * Get a single episode by id
 */
async function getEpisodeById(id) {
  const res = await pool.query('SELECT * FROM episode WHERE id = $1', [id]);
  return res.rows[0] || null;
}

/**
 * Get episode by link
 */
async function getEpisodeByLink(link) {
  const res = await pool.query('SELECT * FROM episode WHERE link = $1', [link]);
  return res.rows[0] || null;
}

/**
 * Delete episodes by anime id (cascades streams if FK ON DELETE CASCADE).
 */
async function deleteEpisodesByAnime(animeId) {
  const res = await pool.query('DELETE FROM episode WHERE anime_id = $1', [animeId]);
  return res.rowCount;
}

module.exports = {
  upsertEpisode,
  bulkUpsertEpisodes,
  listEpisodesByAnime,
  getEpisodeById,
  getEpisodeByLink,
  deleteEpisodesByAnime,
};
