// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const groupRoutes        = require('./routes/groupRoutes');
const competitionRoutes  = require('./routes/competitionRoutes');
const matchRoutes        = require('./routes/matchRoutes');
const playerRoutes       = require('./routes/playerRoutes');
const predictionRoutes   = require('./routes/predictionRoutes');
const resultRoutes       = require('./routes/resultRoutes');

const app = express();
app.use(express.json());

// CORS — prod + préviews Vercel
const allowedOrigins = [
  'https://frontend-hackaton-2025.vercel.app',
];
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // ex: curl
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// petit log des requêtes
app.use((req, _res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });

// Health
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

// ⚠️ Monte chaque route avec son préfixe API
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/groups',       groupRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/matches',      matchRoutes);
app.use('/api/players',      playerRoutes);
app.use('/api/predictions',  predictionRoutes);
app.use('/api/results',      resultRoutes);

// 404 propre
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.path }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API up on ${PORT}`));