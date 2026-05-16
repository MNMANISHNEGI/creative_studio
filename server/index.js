require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth');
const projectRoutes  = require('./routes/projects');
const generateRoutes = require('./routes/generate');
const exploreRoutes  = require('./routes/explore');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/explore',  exploreRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', db: 'indigo' }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 IndiGo Creative Server running on http://localhost:${PORT}`);
  console.log(`   DB: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
