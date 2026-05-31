const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// توليد JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// تسجيل دخول
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال اسم المستخدم وكلمة المرور'
      });
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير نشط'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على بيانات المستخدم الحالي
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// إنشاء محامي جديد (Admin فقط)
exports.createLawyer = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال الاسم الكامل'
      });
    }

    // توليد username وpassword تلقائياً
    const username = fullName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    const password = 'lawyer' + Math.random().toString(36).slice(-8);
    const invitationLink = uuidv4();

    const lawyer = await User.create({
      fullName,
      username,
      password,
      email,
      phone,
      role: 'lawyer',
      invitationLink
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب المحامي بنجاح',
      lawyer: {
        id: lawyer._id,
        fullName: lawyer.fullName,
        username: lawyer.username,
        password: password, // سيتم عرضها مرة واحدة فقط
        email: lawyer.email,
        phone: lawyer.phone,
        invitationLink: `${process.env.FRONTEND_URL}/invite/${lawyer.invitationLink}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على جميع المحامين (Admin فقط)
exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer' }).sort('-createdAt');

    res.json({
      success: true,
      count: lawyers.length,
      lawyers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تفعيل/تعطيل محامي (Admin فقط)
exports.toggleLawyerStatus = async (req, res) => {
  try {
    const lawyer = await User.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'المحامي غير موجود'
      });
    }

    lawyer.isActive = !lawyer.isActive;
    await lawyer.save();

    res.json({
      success: true,
      message: `تم ${lawyer.isActive ? 'تفعيل' : 'تعطيل'} الحساب بنجاح`,
      lawyer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};
