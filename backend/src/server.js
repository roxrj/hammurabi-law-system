const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const supabase = require('./config/supabase');

// تحميل متغيرات البيئة
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إنشاء مجلد uploads إن لم يكن موجوداً
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// خدمة الملفات الثابتة
app.use('/uploads', express.static(uploadsDir));

// الطرق (Routes)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// صفحة الترحيب
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في نظام حمورابي لإدارة المكاتب القانونية',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      cases: '/api/cases',
      documents: '/api/documents'
    }
  });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// بدء السيرفر (فقط في حال لم نكن على Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════╗
  ║  🏛️  نظام حمورابي - Backend Server       ║
  ║  🚀 السيرفر يعمل على المنفذ: ${PORT}       ║
  ║  📍 الرابط: http://localhost:${PORT}      ║
  ╚════════════════════════════════════════════╝
    `);
  });
}

// تصدير التطبيق لـ Vercel
module.exports = app;
