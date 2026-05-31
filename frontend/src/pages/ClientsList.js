import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import { Users, Plus, Search, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const res = await clientsAPI.getMyClients();
      setClients(res.data.clients);
    } catch (err) {
      toast.error('فشل تحميل قائمة الموكلين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (value.length > 2) {
      try {
        const res = await clientsAPI.searchClients(value);
        setClients(res.data.clients);
      } catch {}
    } else if (value === '') {
      fetchClients();
    }
  };

  const handleDelete = async (id) => {
    try {
      await clientsAPI.deleteClient(id);
      toast.success('تم حذف الموكل بنجاح');
      setDeleteConfirm(null);
      fetchClients();
    } catch {
      toast.error('فشل حذف الموكل');
    }
  };

  const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-amber-400" size={32} />
            الموكلون
          </h1>
          <p className="text-gray-400 mt-1">{clients.length} موكل</p>
        </div>
        <Link to="/clients/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          إضافة موكل جديد
        </Link>
      </div>

      {/* شريط البحث */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchKeyword}
          onChange={handleSearch}
          placeholder="البحث بالاسم أو رقم الهوية أو الهاتف..."
          className="input-field pr-12"
        />
      </div>

      {/* قائمة الموكلين */}
      {clients.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400 mb-2">لا يوجد موكلون</p>
          <p className="text-gray-500 mb-6">ابدأ بإضافة موكلك الأول</p>
          <Link to="/clients/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            إضافة موكل
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client._id} className="card hover:border-amber-600 transition-all duration-300 group">
              {/* رأس البطاقة */}
              <div className="flex items-center gap-4 mb-4">
                {client.photo ? (
                  <img
                    src={`${API_BASE}${client.photo}`}
                    alt={client.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center text-white text-2xl font-bold">
                    {client.fullName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">{client.fullName}</h3>
                  <span className={`badge text-xs ${
                    client.status === 'نشط' ? 'badge-success' :
                    client.status === 'مكتمل' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>

              {/* بيانات الموكل */}
              <div className="space-y-2 mb-4">
                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Phone size={14} className="text-amber-400 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Mail size={14} className="text-amber-400 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.idNumber && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-amber-400">🪪</span>
                    <span>{client.idNumber}</span>
                  </div>
                )}
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                <Link
                  to={`/clients/${client._id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-semibold"
                >
                  <Eye size={16} />
                  فتح الملف
                </Link>
                <Link
                  to={`/clients/${client._id}/edit`}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </Link>
                <button
                  onClick={() => setDeleteConfirm(client._id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">تأكيد الحذف</h3>
            <p className="text-gray-300 mb-6">
              هل أنت متأكد من حذف هذا الموكل؟ سيتم حذف جميع بياناته ومستنداته نهائياً.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn-danger"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
