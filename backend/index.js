require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Uploads Directory ───────────────────────────────────────────
// Vercel มี Read-Only filesystem → ใช้ /tmp แทนบน Production
const uploadDir = IS_PRODUCTION
  ? '/tmp/uploads'
  : path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create uploads dir:', e.message);
}

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    if (origin.includes('vercel.app')) return callback(null, true);
    callback(new Error('CORS policy violation'));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// ─── Health Check ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Pet Management API is running',
    env: process.env.NODE_ENV || 'development',
    db: process.env.DATABASE_URL ? 'configured' : 'NOT CONFIGURED ⚠️',
  });
});

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/pets', require('./src/routes/petRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/records', require('./src/routes/medicalRecordRoutes'));

// ─── Error Handlers ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('GLOBAL_ERROR:', err.message);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Export for Vercel Serverless
module.exports = app;
