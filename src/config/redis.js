const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://default:ATpvAAIncDJkMDlmMjVlNDI5YzM0M2U3YjNmODM4MGU2NWY3ZWM0ZnAyMTQ5NTk@unified-stinkbug-14959.upstash.io:6379'
});

client.on('connect', () => console.log('⚡ Connected to Redis'));
client.on('error', (err) => console.error('❌ Redis error:', err));

(async () => {
  await client.connect();
})();

module.exports = client;
