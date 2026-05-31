const Client = require('../models/Client');
const fs = require('fs');
const path = require('path');

// إنشاء موكل جديد
exports.createClient = async (req, res) => {
  try {
    const { fullName, idNumber, phone, email, address, dateOfBirth, nationality, occupation, notes } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال الاسم والهاتف'
      });
    }

    let photo = null;
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    const client = await Client.create({
      lawyer: req.user.id,
      fullName,
      idNumber,
      phone,
      email,
      address,
      dateOfBirth,
      photo,
      nationality,
      occupation,
      notes
    });

    // إنشاء مجلد للموكل
    const clientFolder = path.join(process.env.UPLOAD_PATH || './uploads', `client_${client._id}`);
    const subFolders = ['القضايا', 'عقد_الأتعاب', 'المستندات_العامة', 'المراسلات', 'الأحكام_والقرارات'];
    
    if (!fs.existsSync(clientFolder)) {
      fs.mkdirSync(clientFolder, { recursive: true });
      subFolders.forEach(folder => {
        fs.mkdirSync(path.join(clientFolder, folder), { recursive: true });
      });
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء ملف الموكل بنجاح',
      client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على جميع موكلي المحامي
exports.getMyClients = async (req, res) => {
  try {
    const clients = await Client.find({ lawyer: req.user.id }).sort('-createdAt');

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على موكل محدد
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'الموكل غير موجود'
      });
    }

    // التحقق من أن هذا الموكل يخص المحامي الحالي
    if (client.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض هذا الموكل'
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تحديث بيانات الموكل
exports.updateClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'الموكل غير موجود'
      });
    }

    // التحقق من الصلاحية
    if (client.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا الموكل'
      });
    }

    const { fullName, idNumber, phone, email, address, dateOfBirth, nationality, occupation, notes, status } = req.body;

    if (fullName) client.fullName = fullName;
    if (idNumber) client.idNumber = idNumber;
    if (phone) client.phone = phone;
    if (email) client.email = email;
    if (address) client.address = address;
    if (dateOfBirth) client.dateOfBirth = dateOfBirth;
    if (nationality) client.nationality = nationality;
    if (occupation) client.occupation = occupation;
    if (notes) client.notes = notes;
    if (status) client.status = status;

    if (req.file) {
      // حذف الصورة القديمة
      if (client.photo) {
        const oldPhotoPath = path.join(process.cwd(), client.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      client.photo = `/uploads/${req.file.filename}`;
    }

    await client.save();

    res.json({
      success: true,
      message: 'تم تحديث بيانات الموكل بنجاح',
      client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// حذف موكل
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'الموكل غير موجود'
      });
    }

    // التحقق من الصلاحية
    if (client.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذا الموكل'
      });
    }

    // حذف الصورة
    if (client.photo) {
      const photoPath = path.join(process.cwd(), client.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // حذف مجلد الموكل
    const clientFolder = path.join(process.env.UPLOAD_PATH || './uploads', `client_${client._id}`);
    if (fs.existsSync(clientFolder)) {
      fs.rmSync(clientFolder, { recursive: true, force: true });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف الموكل بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// البحث عن موكلين
exports.searchClients = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال كلمة البحث'
      });
    }

    const clients = await Client.find({
      lawyer: req.user.id,
      $or: [
        { fullName: { $regex: keyword, $options: 'i' } },
        { idNumber: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};
