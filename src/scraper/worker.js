require('dotenv').config();
const Queue = require('bull');
const { scrapeAnime } = require('./index');

const scrapeQueue = new Queue('scrapeQueue', process.env.REDIS_URL);

// Process jobs
scrapeQueue.process(async () => {
  console.log('🕒 Scraping started at', new Date());
  await scrapeAnime();
  console.log('✅ Scraping completed at', new Date());
});

// Schedule every hour
scrapeQueue.add({}, { repeat: { cron: '0 * * * *' } });

console.log('⚡ Scraper worker running...');
