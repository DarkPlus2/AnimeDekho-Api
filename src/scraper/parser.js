const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// selectors.json makes it flexible
const selectorsPath = path.join(__dirname, 'selectors.json');
let selectors = JSON.parse(fs.readFileSync(selectorsPath));

function parseHome(html) {
  const $ = cheerio.load(html);
  const animeList = [];

  $(selectors.animeContainer).each((i, el) => {
    const title = $(el).find(selectors.animeTitle).text().trim();
    const link = $(el).find(selectors.animeLink).attr('href');
    const image = $(el).find(selectors.animeImage).attr('src');
    const synopsis = $(el).find(selectors.animeSynopsis).text().trim();
    animeList.push({ title, link, image, synopsis });
  });

  return animeList;
}

function parseEpisodes(html, animeId) {
  const $ = cheerio.load(html);
  const episodes = [];

  $(selectors.episodeContainer).each((i, el) => {
    const title = $(el).find(selectors.episodeTitle).text().trim();
    const link = $(el).find(selectors.episodeLink).attr('href');
    const episode_number = $(el).find(selectors.episodeNumber).text().trim();
    episodes.push({ animeId, title, link, episode_number });
  });

  return episodes;
}

function parseStreaming(html, episodeId) {
  const $ = cheerio.load(html);
  const streams = [];

  $(selectors.streamContainer).each((i, el) => {
    const server = $(el).find(selectors.streamServer).text().trim();
    const url = $(el).find(selectors.streamLink).attr('href');
    const quality = $(el).find(selectors.streamQuality).text().trim();
    streams.push({ episodeId, server, url, quality });
  });

  return streams;
}

module.exports = { parseHome, parseEpisodes, parseStreaming };
