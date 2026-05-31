import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Users, Plus, ToggleLeft, ToggleRight, Copy, Check, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [newLawyerData, setNewLawyerData] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [adding, setAdding] = useState(false);

  const fetchLawyers = async () => {
    try {
      const res = await authAPI.getAllLawyers();
      setLawyers(res.data.lawyers);
    } catch {
      toast.error('فشل تحميل قائمة المحامين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLawyers(); }, []);

  const handleAddLawyer = async (e) => {
    e.preventDefault();
    if (!form.fullName) {
      toast.error('الرجاء إدخال الاسم الكامل');
      return;
    }
    setAdding(true);
    try {
      const res = await authAPI.createLawyer(form);
      setNewLawyerData(res.data.lawyer);
      toast.success('تم إنشاء حساب المحامي بنجاح');
      fetchLawyers();
      setForm({ fullName: '', email: '', phone: '' });
      setAddModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء الحساب');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await authAPI.toggleLawyerStatus(id);
      toast.success('تم تغيير حالة الحساب');
      fetchLawyers();
    } catch {
      toast.error('فشل تغيير الحالة');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-amber-400" size={32} />
            إدارة المحامين
          </h1>
          <p className="text-gray-400 mt-1">{lawyers.length} محامٍ مسجّل</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة محامٍ
        </button>
      </div>

      {/* قائمة المحامين */}
      {lawyers.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400 mb-6">لا يوجد محامون مسجّلون</p>
          <button onClick={() => setAddModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            إضافة محامٍ
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>المحامي</th>
                <th>اسم المستخدم</th>
                <th>الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>تاريخ الإنشاء</th>
                <th>رابط الدعوة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {lawyers.map((lawyer) => (
                <tr key={lawyer._id}>
                  <td colSpan="7">
                    <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-2">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                            {lawyer.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-bold">{lawyer.fullName}</p>
                            <p className="text-xs text-gray-400">محامي مسجل</p>
                          </div>
                        </div>
                        
                        <div className="h-10 w-px bg-gray-700"></div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">اسم المستخدم</p>
                          <div className="flex items-center gap-2">
                            <code className="text-amber-400 font-mono bg-black/30 px-2 py-1 rounded">{lawyer.username}</code>
                            <button onClick={() => copyToClipboard(lawyer.username, 'اسم المستخدم')} className="text-gray-500 hover:text-white">
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="h-10 w-px bg-gray-700"></div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">رابط تسجيل الدخول</p>
                          <button 
                            onClick={() => copyToClipboard(`${window.location.origin}/login?u=${lawyer.username}`, 'رابط الدخول')}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-400/10 px-3 py-1 rounded-lg transition-colors"
                          >
                            <Copy size={14} />
                            <span className="text-sm font-medium">نسخ الرابط</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${lawyer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {lawyer.isActive ? 'نشط الآن' : 'متوقف'}
                        </span>
                        <button
                          onClick={() => handleToggle(lawyer._id)}
                          className={`p-2 rounded-lg transition-colors ${lawyer.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                          title={lawyer.isActive ? 'إيقاف النظام' : 'تشغيل النظام'}
                        >
                          {lawyer.isActive ? <ToggleLeft size={24} /> : <ToggleRight size={24} />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(lawyer._id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        lawyer.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {lawyer.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      {lawyer.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة إضافة محامٍ */}
      {addModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={20} className="text-amber-400" />
              إضافة محامٍ جديد
            </h3>
            <form onSubmit={handleAddLawyer} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">الاسم الكامل *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="input-field"
                  placeholder="أدخل اسم المحامي"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">الهاتف</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  placeholder="07XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="example@email.com"
                />
              </div>
              <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-3 text-sm text-blue-200">
                سيتم توليد اسم مستخدم وكلمة مرور وإظهارهما لك تلقائياً
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={adding} className="flex-1 btn-primary disabled:opacity-50">
                  {adding ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
                <button type="button" onClick={() => setAddModal(false)} className="flex-1 btn-secondary">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة بيانات المحامي الجديد */}
      {newLawyerData && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-green-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">تم إنشاء الحساب بنجاح!</h3>
              <p className="text-gray-400 text-sm mt-1">احفظ هذه البيانات قبل الإغلاق</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'الاسم الكامل', value: newLawyerData.fullName },
                { label: 'اسم المستخدم', value: newLawyerData.username },
                { label: 'كلمة المرور', value: newLawyerData.password, secret: true },
                { label: 'رابط الدعوة', value: newLawyerData.invitationLink },
              ].map(({ label, value, secret }) => (
                <div key={label} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                    <code className={`text-sm font-mono ${secret ? 'text-red-400' : 'text-amber-400'} break-all`}>
                      {value}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value, label)}
                    className="p-2 text-gray-400 hover:text-white flex-shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setNewLawyerData(null)}
              className="w-full btn-primary mt-6"
            >
              حسناً، حفظت البيانات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
