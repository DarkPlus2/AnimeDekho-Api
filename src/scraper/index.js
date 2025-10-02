const axios = require('axios');
const parser = require('./parser');
const pool = require('../config/db');
const { saveAnime } = require('../models/anime');
const { saveEpisode } = require('../models/episode');
const { saveStream } = require('../models/streaming');

const BASE_URL = 'https://animedekho.co/';

async function scrapeAnime() {
  const { data } = await axios.get(BASE_URL, {
    headers: { 'User-Agent': 'AnimedekhoBot/1.0' }
  });

  const animeList = parser.parseHome(data);

  for (const anime of animeList) {
    const animeId = await saveAnime(anime);
    await scrapeEpisodes(anime.link, animeId);
  }
}

async function scrapeEpisodes(animeUrl, animeId) {
  const { data } = await axios.get(animeUrl, {
    headers: { 'User-Agent': 'AnimedekhoBot/1.0' }
  });

  const episodes = parser.parseEpisodes(data, animeId);

  for (const ep of episodes) {
    const epId = await saveEpisode(ep);
    await scrapeStreams(ep.link, epId);
  }
}

async function scrapeStreams(epUrl, epId) {
  const { data } = await axios.get(epUrl, {
    headers: { 'User-Agent': 'AnimedekhoBot/1.0' }
  });

  const streams = parser.parseStreaming(data, epId);

  for (const s of streams) {
    await saveStream(s);
  }
}

module.exports = { scrapeAnime };
