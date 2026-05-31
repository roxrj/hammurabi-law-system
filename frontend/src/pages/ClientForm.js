import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import { Save, ArrowRight, Upload, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    fullName: '', idNumber: '', phone: '', email: '',
    address: '', dateOfBirth: '', nationality: 'عراقي',
    occupation: '', notes: '', status: 'نشط'
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (isEdit) {
      const fetchClient = async () => {
        try {
          const res = await clientsAPI.getClientById(id);
          const c = res.data.client;
          setFormData({
            fullName: c.fullName || '',
            idNumber: c.idNumber || '',
            phone: c.phone || '',
            email: c.email || '',
            address: c.address || '',
            dateOfBirth: c.dateOfBirth ? c.dateOfBirth.substring(0, 10) : '',
            nationality: c.nationality || 'عراقي',
            occupation: c.occupation || '',
            notes: c.notes || '',
            status: c.status || 'نشط'
          });
          if (c.photo) setPhotoPreview(`${API_BASE}${c.photo}`);
        } catch {
          toast.error('فشل تحميل بيانات الموكل');
          navigate('/clients');
        } finally {
          setFetching(false);
        }
      };
      fetchClient();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast.error('الرجاء ملء الاسم والهاتف');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v) data.append(k, v); });
      if (photo) data.append('photo', photo);

      if (isEdit) {
        await clientsAPI.updateClient(id, data);
        toast.success('تم تحديث بيانات الموكل');
        navigate(`/clients/${id}`);
      } else {
        const res = await clientsAPI.createClient(data);
        toast.success('تم إنشاء ملف الموكل');
        navigate(`/clients/${res.data.client._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* الرأس */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowRight size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isEdit ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isEdit ? 'قم بتحديث معلومات الموكل' : 'أدخل معلومات الموكل الجديد'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* صورة الموكل */}
        <div className="card text-center">
          <div className="mb-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="صورة الموكل"
                className="w-28 h-28 rounded-full object-cover border-4 border-amber-600 mx-auto"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-700 border-4 border-dashed border-gray-500 flex items-center justify-center mx-auto">
                <User size={40} className="text-gray-500" />
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm">
              <Upload size={16} />
              رفع صورة
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* المعلومات الأساسية */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-gray-700 flex items-center gap-2">
            <User size={20} className="text-amber-400" />
            المعلومات الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                الاسم الكامل <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                رقم الهوية / الجنسية
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="input-field"
                placeholder="رقم الهوية أو البطاقة"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                رقم الهاتف <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="07XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                الجنسية
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="input-field"
                placeholder="عراقي"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                المهنة
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="input-field"
                placeholder="المهنة أو العمل"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="نشط">نشط</option>
                <option value="غير نشط">غير نشط</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-300 mb-2 font-semibold">
              العنوان
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="المدينة، الحي، الشارع..."
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-300 mb-2 font-semibold">
              ملاحظات
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="input-field resize-none"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إنشاء الملف')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 btn-secondary py-3"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
