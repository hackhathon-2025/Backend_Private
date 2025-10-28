const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['https://frontend-hackaton-2025.vercel.app'],
  credentials: true
}));

// Healthcheck
app.get('/api/health', (req, res) => res.status(200).json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API up on ${PORT}`));