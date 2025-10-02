-- Anime table
CREATE TABLE IF NOT EXISTS anime (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT UNIQUE NOT NULL,
  image TEXT,
  synopsis TEXT,
  scraped_at TIMESTAMP DEFAULT NOW()
);

-- Episode table
CREATE TABLE IF NOT EXISTS episode (
  id SERIAL PRIMARY KEY,
  anime_id INT REFERENCES anime(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT UNIQUE NOT NULL,
  episode_number TEXT,
  scraped_at TIMESTAMP DEFAULT NOW()
);

-- Streaming table
CREATE TABLE IF NOT EXISTS streaming (
  id SERIAL PRIMARY KEY,
  episode_id INT REFERENCES episode(id) ON DELETE CASCADE,
  server TEXT,
  url TEXT,
  quality TEXT,
  scraped_at TIMESTAMP DEFAULT NOW()
);
