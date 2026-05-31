require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ متصل بقاعدة البيانات');
};

const createAdmin = async () => {
  try {
    await connectDB();

    // تحقق من عدم وجود أدمن مسبقاً
    const User = require('./src/models/User');
    const existing = await User.findOne({ role: 'admin' });

    if (existing) {
      console.log('⚠️  يوجد حساب أدمن مسبقاً:', existing.username);
      process.exit(0);
    }

    const admin = await User.create({
      fullName: 'مدير النظام',
      username: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@hammurabi.com',
      role: 'admin',
      isActive: true,
      invitationLink: 'admin-main-' + Date.now()
    });

    console.log('✅ تم إنشاء حساب الأدمن بنجاح!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('اسم المستخدم:', admin.username);
    console.log('كلمة المرور:', process.env.ADMIN_DEFAULT_PASSWORD || 'admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
};

createAdmin();
