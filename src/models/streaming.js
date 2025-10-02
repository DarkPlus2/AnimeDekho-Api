// src/models/streaming.js
const pool = require('../config/db');
const { withTransaction } = require('./_tx');

/**
 * Upsert a stream row.
 * If streaming.url has a UNIQUE constraint (recommended), we use ON CONFLICT.
 * If not, the function will fallback to SELECT -> UPDATE or INSERT.
 *
 * stream: { episode_id, server, url, quality, scraped_at? }
 * @param {Object} stream
 * @param {Object} [client]
 */
async function upsertStream(stream, client = null) {
  const useClient = client || pool;

  // Try ON CONFLICT path first (works if url is unique)
  try {
    const sql = `
      INSERT INTO streaming (episode_id, server, url, quality, scraped_at)
      VALUES ($1, $2, $3, $4, COALESCE($5, NOW()))
      ON CONFLICT (url)
      DO UPDATE SET episode_id = EXCLUDED.episode_id,
                    server = EXCLUDED.server,
                    quality = EXCLUDED.quality,
                    scraped_at = COALESCE(EXCLUDED.scraped_at, NOW())
      RETURNING *;
    `;
    const params = [
      stream.episode_id,
      stream.server || null,
      stream.url,
      stream.quality || null,
      stream.scraped_at || null,
    ];
    const res = await useClient.query(sql, params);
    return res.rows[0];
  } catch (err) {
    // Possible reason: no unique constraint on url. Fallback to select/update/insert.
    if (err.code && err.code === '23505') {
      // Unique violation - rethrow
      throw err;
    }
    // Fallback logic (safer if schema lacks unique constraint)
    const lookup = await useClient.query('SELECT id FROM streaming WHERE url = $1', [stream.url]);
    if (lookup.rowCount) {
      const id = lookup.rows[0].id;
      const upd = await useClient.query(
        `UPDATE streaming SET episode_id=$1, server=$2, quality=$3, scraped_at=COALESCE($4, NOW()) WHERE id=$5 RETURNING *`,
        [stream.episode_id, stream.server || null, stream.quality || null, stream.scraped_at || null, id]
      );
      return upd.rows[0];
    } else {
      const ins = await useClient.query(
        `INSERT INTO streaming (episode_id, server, url, quality, scraped_at) VALUES ($1,$2,$3,$4,COALESCE($5,NOW())) RETURNING *`,
        [stream.episode_id, stream.server || null, stream.url, stream.quality || null, stream.scraped_at || null]
      );
      return ins.rows[0];
    }
  }
}

/**
 * Bulk upsert streams (transactional)
 */
async function bulkUpsertStreams(streams = []) {
  if (!Array.isArray(streams) || streams.length === 0) return [];
  return await withTransaction(async (client) => {
    const out = [];
    for (const s of streams) {
      const row = await upsertStream(s, client);
      out.push(row);
    }
    return out;
  });
}

/**
 * Get streams by episode id
 */
async function getStreamsByEpisode(episodeId) {
  const res = await pool.query('SELECT * FROM streaming WHERE episode_id = $1 ORDER BY scraped_at DESC', [episodeId]);
  return res.rows;
}

/**
 * Delete streams for an episode (useful when re-scraping)
 */
async function deleteStreamsByEpisode(episodeId) {
  const res = await pool.query('DELETE FROM streaming WHERE episode_id = $1', [episodeId]);
  return res.rowCount;
}

module.exports = {
  upsertStream,
  bulkUpsertStreams,
  getStreamsByEpisode,
  deleteStreamsByEpisode,
};
