// Netlify Serverless Function wrapper for Express API

const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const apiRoutes = require("../../src/routes/api");

// Initialize express app
const app = express();

// 🔧 Middleware
app.use(cors());                  // Allow cross-origin requests
app.use(express.json());          // Parse JSON body
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));           // Request logging

// ✅ API routes
app.use("/api", apiRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "AnimeDekho Scraper API is running 🚀",
    endpoints: [
      "/api/anime",
      "/api/episodes/:animeId",
      "/api/streams/:episodeId",
      "/api/scrape"
    ]
  });
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ❌ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 API Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export handler for Netlify
module.exports.handler = serverless(app);
