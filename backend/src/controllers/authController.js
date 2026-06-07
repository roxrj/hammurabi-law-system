const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// توليد JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
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

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    if (user.status !== 'active' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'الحساب غير نشط أو بانتظار التفعيل'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        role: user.role
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        role: user.role,
        status: user.status
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

    const username = fullName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    const password = 'lawyer' + Math.random().toString(36).slice(-8);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: lawyer, error } = await supabase
      .from('users')
      .insert([
        {
          full_name: fullName,
          username,
          password: hashedPassword,
          email,
          phone,
          role: 'lawyer',
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب المحامي بنجاح',
      lawyer: {
        id: lawyer.id,
        fullName: lawyer.full_name,
        username: lawyer.username,
        password: password, // للعرض مرة واحدة
        email: lawyer.email,
        phone: lawyer.phone,
        invitationLink: `${process.env.FRONTEND_URL || ''}/login?u=${lawyer.username}`
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
    const { data: lawyers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'lawyer')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedLawyers = lawyers.map(l => ({
      ...l,
      fullName: l.full_name
    }));

    res.json({
      success: true,
      count: formattedLawyers.length,
      lawyers: formattedLawyers
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
    const { data: lawyer, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !lawyer) {
      return res.status(404).json({
        success: false,
        message: 'المحامي غير موجود'
      });
    }

    const newStatus = lawyer.status === 'active' ? 'inactive' : 'active';

    const { data: updatedLawyer, error: updateError } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: `تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} الحساب بنجاح`,
      lawyer: {
        ...updatedLawyer,
        fullName: updatedLawyer.full_name
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
