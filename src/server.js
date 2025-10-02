require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes/api'); // you’ll add routes later
// const adminRoutes = require('./routes/admin'); // optional

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', apiRoutes);
// app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: "Animedekho Advanced Backend Running 🚀" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});
