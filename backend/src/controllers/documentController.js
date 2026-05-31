const Document = require('../models/Document');
const Client = require('../models/Client');
const Case = require('../models/Case');
const fs = require('fs');
const path = require('path');

// رفع مستند جديد
exports.uploadDocument = async (req, res) => {
  try {
    const { clientId, category, title, description, caseId } = req.body;

    if (!clientId || !category || !title || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء ملء جميع الحقول المطلوبة'
      });
    }

    // التحقق من أن الموكل يخص المحامي الحالي
    const client = await Client.findById(clientId);
    if (!client || client.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    // إذا كان هناك caseId، تحقق منها أيضاً
    if (caseId) {
      const caseData = await Case.findById(caseId);
      if (!caseData || caseData.lawyer.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية'
        });
      }
    }

    const document = await Document.create({
      client: clientId,
      lawyer: req.user.id,
      case: caseId || null,
      category,
      title,
      description,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    res.status(201).json({
      success: true,
      message: 'تم رفع المستند بنجاح',
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على مستندات موكل معين
exports.getClientDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { category } = req.query;

    // التحقق من أن الموكل يخص المحامي الحالي
    const client = await Client.findById(clientId);
    if (!client || client.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    let query = { client: clientId, lawyer: req.user.id };
    if (category) {
      query.category = category;
    }

    const documents = await Document.find(query).sort('-uploadDate');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على مستندات قضية معينة
exports.getCaseDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;

    // التحقق من أن القضية تخص المحامي الحالي
    const caseData = await Case.findById(caseId);
    if (!caseData || caseData.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const documents = await Document.find({ case: caseId }).sort('-uploadDate');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على مستند محدد
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستند غير موجود'
      });
    }

    // التحقق من الصلاحية
    if (document.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تحديث معلومات المستند
exports.updateDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستند غير موجود'
      });
    }

    if (document.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const { title, description, category } = req.body;

    if (title) document.title = title;
    if (description) document.description = description;
    if (category) document.category = category;

    await document.save();

    res.json({
      success: true,
      message: 'تم تحديث المستند بنجاح',
      document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// حذف مستند
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستند غير موجود'
      });
    }

    if (document.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    // حذف الملف من النظام
    const filePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف المستند بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// البحث عن مستندات
exports.searchDocuments = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال كلمة البحث'
      });
    }

    const documents = await Document.find({
      lawyer: req.user.id,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { fileName: { $regex: keyword, $options: 'i' } }
      ]
    }).sort('-uploadDate');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على إحصائيات
exports.getStats = async (req, res) => {
  try {
    const clients = await Client.countDocuments({ lawyer: req.user.id });
    const cases = await Case.countDocuments({ lawyer: req.user.id });
    const documents = await Document.countDocuments({ lawyer: req.user.id });
    const activeCases = await Case.countDocuments({ lawyer: req.user.id, status: 'جارية' });

    res.json({
      success: true,
      stats: {
        totalClients: clients,
        totalCases: cases,
        activeCases,
        totalDocuments: documents
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
