require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี (ใช้งานเฉพาะ local)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS - รองรับทั้ง Local และ Production
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // อนุญาต requests ที่ไม่มี origin (เช่น mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    // อนุญาต Vercel preview deployments
    if (origin.includes('vercel.app')) return callback(null, true);
    callback(new Error('CORS policy violation'));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Smart Pet Management API is running',
    env: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/pets', require('./src/routes/petRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/records', require('./src/routes/medicalRecordRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Export for Vercel serverless
module.exports = app;

// Listen locally (ไม่ทำงานบน Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
} else {
  // Production: still listen for Render/Railway compatibility
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}
