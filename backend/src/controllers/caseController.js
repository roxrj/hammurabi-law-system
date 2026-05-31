const Case = require('../models/Case');
const Client = require('../models/Client');
const Document = require('../models/Document');
const axios = require('axios');
const fs = require('fs');

// إنشاء قضية جديدة
exports.createCase = async (req, res) => {
  try {
    const { clientId, caseNumber, title, caseType, court, opposingParty, description, filingDate } = req.body;

    if (!clientId || !caseNumber || !title || !caseType || !court || !filingDate) {
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

    const newCase = await Case.create({
      client: clientId,
      lawyer: req.user.id,
      caseNumber,
      title,
      caseType,
      court,
      opposingParty,
      description,
      filingDate
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء القضية بنجاح',
      case: newCase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على قضايا موكل معين
exports.getClientCases = async (req, res) => {
  try {
    const { clientId } = req.params;

    // التحقق من أن الموكل يخص المحامي الحالي
    const client = await Client.findById(clientId);
    if (!client || client.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const cases = await Case.find({ client: clientId }).sort('-createdAt');

    res.json({
      success: true,
      count: cases.length,
      cases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على قضية محددة
exports.getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).populate('client', 'fullName phone email');

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    // التحقق من الصلاحية
    if (caseData.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    res.json({
      success: true,
      case: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تحديث القضية
exports.updateCase = async (req, res) => {
  try {
    let caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (caseData.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const { title, caseType, court, opposingParty, description, status, verdict } = req.body;

    if (title) caseData.title = title;
    if (caseType) caseData.caseType = caseType;
    if (court) caseData.court = court;
    if (opposingParty) caseData.opposingParty = opposingParty;
    if (description) caseData.description = description;
    if (status) caseData.status = status;
    if (verdict) caseData.verdict = verdict;

    await caseData.save();

    res.json({
      success: true,
      message: 'تم تحديث القضية بنجاح',
      case: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// إضافة جلسة محكمة
exports.addSession = async (req, res) => {
  try {
    const { date, notes, attendees } = req.body;

    let caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (caseData.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    caseData.sessions.push({
      date,
      notes,
      attendees
    });

    await caseData.save();

    res.json({
      success: true,
      message: 'تمت إضافة الجلسة بنجاح',
      case: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تحليل القضية بالذكاء الاصطناعي
exports.analyzeCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id).populate('client', 'fullName');

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (caseData.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    // جمع جميع المعلومات عن القضية
    const caseInfo = `
    تحليل القضية:
    
    رقم القضية: ${caseData.caseNumber}
    عنوان القضية: ${caseData.title}
    نوع القضية: ${caseData.caseType}
    المحكمة: ${caseData.court}
    الطرف الآخر: ${caseData.opposingParty || 'غير محدد'}
    تاريخ الرفع: ${caseData.filingDate}
    الحالة الحالية: ${caseData.status}
    
    وصف القضية:
    ${caseData.description}
    
    جلسات المحكمة:
    ${caseData.sessions.map(s => `- التاريخ: ${s.date}, الملاحظات: ${s.notes}`).join('\n')}
    
    الحكم/القرار (إن وجد):
    ${caseData.verdict || 'لم يصدر حكم بعد'}
    `;

    // استخدام OpenAI API المتاحة في البيئة
    const { OpenAI } = require('openai');
    const client = new OpenAI();

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "أنت خبير قانوني عراقي ملم بجميع القوانين العراقية (قانون العقوبات، القانون المدني، قانون الأحوال الشخصية، قانون المرافعات المدنية، إلخ). مهمتك هي تقديم استشارات قانونية دقيقة بناءً على المتن القانوني العراقي."
        },
        {
          role: "user",
          content: `بناءً على المتن القانوني العراقي، قم بتحليل القضية التالية بشكل احترافي:
          
          ${caseInfo}
          
          المطلوب:
          1. ملخص قانوني دقيق.
          2. المواد القانونية العراقية ذات الصلة.
          3. الاستراتيجية القانونية المقترحة.
          4. فرصة النجاح والمخاطر.
          
          اجعل الإجابة منظمة جداً وباللغة العربية الفصحى.`
        }
      ]
    });

    const analysisText = response.choices[0].message.content;

    // تحليل النص واستخراج الأقسام
    const lines = analysisText.split('\n');
    const keyPoints = [];
    const recommendations = [];
    
    let currentSection = '';
    for (const line of lines) {
      if (line.includes('النقاط') || line.includes('نقاط')) {
        currentSection = 'keyPoints';
      } else if (line.includes('التوصيات') || line.includes('استراتيجي')) {
        currentSection = 'recommendations';
      } else if (line.trim().startsWith('-') && currentSection === 'keyPoints') {
        keyPoints.push(line.replace('-', '').trim());
      } else if (line.trim().startsWith('-') && currentSection === 'recommendations') {
        recommendations.push(line.replace('-', '').trim());
      }
    }

    // حفظ التحليل في قاعدة البيانات
    caseData.aiAnalysis = {
      summary: analysisText,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['تم التحليل بنجاح'],
      recommendations: recommendations.length > 0 ? recommendations : ['يرجى مراجعة الملف الكامل'],
      analyzedAt: new Date()
    };

    await caseData.save();

    res.json({
      success: true,
      message: 'تم تحليل القضية بنجاح',
      analysis: {
        summary: analysisText,
        keyPoints: caseData.aiAnalysis.keyPoints,
        recommendations: caseData.aiAnalysis.recommendations,
        analyzedAt: caseData.aiAnalysis.analyzedAt
      }
    });
  } catch (error) {
    console.error('خطأ في التحليل:', error.message);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحليل القضية',
      error: error.message
    });
  }
};

// حذف قضية
exports.deleteCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (caseData.lawyer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    await Case.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف القضية بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};
