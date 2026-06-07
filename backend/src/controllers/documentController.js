const supabase = require('../config/supabase');
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

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert([
        {
          client_id: clientId,
          lawyer_id: req.user.id,
          case_id: caseId || null,
          category,
          title,
          description,
          file_name: req.file.originalname,
          file_path: `uploads/${req.file.filename}`,
          file_type: req.file.mimetype
        }
      ])
      .select()
      .single();

    if (docError) throw docError;

    res.status(201).json({
      success: true,
      message: 'تم رفع المستند بنجاح',
      document: {
        ...document,
        fileName: document.file_name,
        filePath: document.file_path,
        fileType: document.file_type
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

// الحصول على مستندات موكل معين
exports.getClientDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { category } = req.query;

    let query = supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .eq('lawyer_id', req.user.id);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: documents, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const formattedDocs = documents.map(d => ({
      ...d,
      fileName: d.file_name,
      filePath: d.file_path,
      fileType: d.file_type
    }));

    res.json({
      success: true,
      count: formattedDocs.length,
      documents: formattedDocs
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

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .eq('lawyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedDocs = documents.map(d => ({
      ...d,
      fileName: d.file_name,
      filePath: d.file_path,
      fileType: d.file_type
    }));

    res.json({
      success: true,
      count: formattedDocs.length,
      documents: formattedDocs
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
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !document) {
      return res.status(404).json({
        success: false,
        message: 'المستند غير موجود'
      });
    }

    if (document.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    res.json({
      success: true,
      document: {
        ...document,
        fileName: document.file_name,
        filePath: document.file_path,
        fileType: document.file_type
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

// تحديث معلومات المستند
exports.updateDocument = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const { data: updatedDoc, error } = await supabase
      .from('documents')
      .update({ title, description, category })
      .eq('id', req.params.id)
      .eq('lawyer_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'تم تحديث المستند بنجاح',
      document: {
        ...updatedDoc,
        fileName: updatedDoc.file_name,
        filePath: updatedDoc.file_path,
        fileType: updatedDoc.file_type
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

// حذف مستند
exports.deleteDocument = async (req, res) => {
  try {
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({
        success: false,
        message: 'المستند غير موجود'
      });
    }

    if (document.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية'
      });
    }

    const filePath = path.join(process.cwd(), document.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

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

// الحصول على إحصائيات
exports.getStats = async (req, res) => {
  try {
    const { count: clients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('lawyer_id', req.user.id);
    const { count: cases } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('lawyer_id', req.user.id);
    const { count: documents } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('lawyer_id', req.user.id);
    const { count: activeCases } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('lawyer_id', req.user.id).eq('status', 'جارية');

    res.json({
      success: true,
      stats: {
        totalClients: clients || 0,
        totalCases: cases || 0,
        activeCases: activeCases || 0,
        totalDocuments: documents || 0
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
