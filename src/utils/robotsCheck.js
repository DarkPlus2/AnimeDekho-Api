const axios = require('axios');
const robotsParser = require('robots-parser');

let robots;

async function isAllowed(url) {
  if (!robots) {
    const robotsTxt = await axios.get('https://animedekho.co/robots.txt')
      .then(res => res.data)
      .catch(() => '');
    robots = robotsParser('https://animedekho.co/robots.txt', robotsTxt);
  }
  return { allowed: robots.isAllowed(url, 'AnimedekhoBot') };
}

module.exports = { isAllowed };
