const supabase = require('../config/supabase');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// إعداد Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || client.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert([
        {
          client_id: clientId,
          lawyer_id: req.user.id,
          case_number: caseNumber,
          title,
          case_type: caseType,
          court,
          opposing_party: opposingParty,
          description,
          filing_date: filingDate
        }
      ])
      .select()
      .single();

    if (caseError) throw caseError;

    res.status(201).json({
      success: true,
      message: 'تم إنشاء القضية بنجاح',
      case: {
        ...newCase,
        caseNumber: newCase.case_number,
        caseType: newCase.case_type,
        opposingParty: newCase.opposing_party,
        filingDate: newCase.filing_date
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

// الحصول على قضايا موكل معين
exports.getClientCases = async (req, res) => {
  try {
    const { clientId } = req.params;

    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('client_id', clientId)
      .eq('lawyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedCases = cases.map(c => ({
      ...c,
      caseNumber: c.case_number,
      caseType: c.case_type,
      opposingParty: c.opposing_party,
      filingDate: c.filing_date
    }));

    res.json({
      success: true,
      count: formattedCases.length,
      cases: formattedCases
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
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*, clients(full_name, phone, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (caseData.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    res.json({
      success: true,
      case: {
        ...caseData,
        client: {
            fullName: caseData.clients.full_name,
            phone: caseData.clients.phone,
            email: caseData.clients.email
        },
        caseNumber: caseData.case_number,
        caseType: caseData.case_type,
        opposingParty: caseData.opposing_party,
        filingDate: caseData.filing_date
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

// تحديث القضية
exports.updateCase = async (req, res) => {
  try {
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingCase) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (existingCase.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const { title, caseType, court, opposingParty, description, status, verdict } = req.body;
    
    let updateData = {};
    if (title) updateData.title = title;
    if (caseType) updateData.case_type = caseType;
    if (court) updateData.court = court;
    if (opposingParty) updateData.opposing_party = opposingParty;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (verdict) updateData.verdict = verdict;

    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'تم تحديث القضية بنجاح',
      case: {
        ...updatedCase,
        caseNumber: updatedCase.case_number,
        caseType: updatedCase.case_type,
        opposingParty: updatedCase.opposing_party,
        filingDate: updatedCase.filing_date
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

// تحليل القضية بـ Gemini AI
exports.analyzeCase = async (req, res) => {
  try {
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*, clients(full_name)')
      .eq('id', req.params.id)
      .single();

    if (error || !caseData) {
      return res.status(404).json({
        success: false,
        message: 'القضية غير موجودة'
      });
    }

    if (caseData.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const caseInfo = `
    تحليل القضية:
    رقم القضية: ${caseData.case_number}
    عنوان القضية: ${caseData.title}
    نوع القضية: ${caseData.case_type}
    المحكمة: ${caseData.court}
    الطرف الآخر: ${caseData.opposing_party || 'غير محدد'}
    وصف القضية: ${caseData.description}
    الحكم الحالي: ${caseData.verdict || 'لم يصدر بعد'}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `أنت خبير قانوني عراقي. بناءً على المتن القانوني العراقي، قم بتحليل القضية التالية بشكل احترافي:
    ${caseInfo}
    المطلوب: 1. ملخص قانوني. 2. المواد القانونية العراقية ذات الصلة. 3. الاستراتيجية المقترحة. 4. فرصة النجاح والمخاطر.
    اجعل الإجابة منظمة وباللغة العربية الفصحى.`;

    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();

    // تحديث القضية بالتحليل
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        ai_analysis: {
          summary: analysisText,
          analyzed_at: new Date()
        }
      })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'تم تحليل القضية بنجاح بواسطة Gemini',
      analysis: {
        summary: analysisText,
        analyzedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Gemini Error:', error.message);
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
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', req.params.id)
      .eq('lawyer_id', req.user.id);

    if (error) throw error;

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
