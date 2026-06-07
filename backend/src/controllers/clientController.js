const supabase = require('../config/supabase');
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
      photo = `uploads/${req.file.filename}`;
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          lawyer_id: req.user.id,
          full_name: fullName,
          id_number: idNumber,
          phone,
          email,
          address,
          date_of_birth: dateOfBirth,
          photo,
          nationality,
          occupation,
          notes
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // إنشاء مجلد للموكل
    const clientFolder = path.join(process.env.UPLOAD_PATH || './uploads', `client_${client.id}`);
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
      client: {
        ...client,
        fullName: client.full_name, // للتوافق مع Frontend
        idNumber: client.id_number
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

// الحصول على جميع موكلي المحامي
exports.getMyClients = async (req, res) => {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('lawyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // تحويل الأسماء لتتوافق مع Frontend
    const formattedClients = clients.map(c => ({
      ...c,
      fullName: c.full_name,
      idNumber: c.id_number
    }));

    res.json({
      success: true,
      count: formattedClients.length,
      clients: formattedClients
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
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !client) {
      return res.status(404).json({
        success: false,
        message: 'الموكل غير موجود'
      });
    }

    // التحقق من الصلاحية
    if (client.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض هذا الموكل'
      });
    }

    res.json({
      success: true,
      client: {
        ...client,
        fullName: client.full_name,
        idNumber: client.id_number
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

// تحديث بيانات الموكل
exports.updateClient = async (req, res) => {
  try {
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingClient) {
      return res.status(404).json({
        success: false,
        message: 'الموكل غير موجود'
      });
    }

    if (existingClient.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا الموكل'
      });
    }

    const { fullName, idNumber, phone, email, address, dateOfBirth, nationality, occupation, notes, status } = req.body;
    
    let updateData = {};
    if (fullName) updateData.full_name = fullName;
    if (idNumber) updateData.id_number = idNumber;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
    if (nationality) updateData.nationality = nationality;
    if (occupation) updateData.occupation = occupation;
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;

    if (req.file) {
      if (existingClient.photo) {
        const oldPhotoPath = path.join(process.cwd(), existingClient.photo);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }
      updateData.photo = `uploads/${req.file.filename}`;
    }

    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'تم تحديث بيانات الموكل بنجاح',
      client: {
        ...updatedClient,
        fullName: updatedClient.full_name,
        idNumber: updatedClient.id_number
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

// حذف موكل
exports.deleteClient = async (req, res) => {
  try {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !client) {
      return res.status(404).json({
        success: false,
        message: 'الموكل غير موجود'
      });
    }

    if (client.lawyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذا الموكل'
      });
    }

    if (client.photo) {
      const photoPath = path.join(process.cwd(), client.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    const clientFolder = path.join(process.env.UPLOAD_PATH || './uploads', `client_${client.id}`);
    if (fs.existsSync(clientFolder)) {
      fs.rmSync(clientFolder, { recursive: true, force: true });
    }

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

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

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('lawyer_id', req.user.id)
      .or(`full_name.ilike.%${keyword}%,id_number.ilike.%${keyword}%,phone.ilike.%${keyword}%,email.ilike.%${keyword}%`);

    if (error) throw error;

    const formattedClients = clients.map(c => ({
      ...c,
      fullName: c.full_name,
      idNumber: c.id_number
    }));

    res.json({
      success: true,
      count: formattedClients.length,
      clients: formattedClients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};
