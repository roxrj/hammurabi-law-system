import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsAPI, casesAPI, documentsAPI } from '../services/api';
import {
  User, Phone, Mail, MapPin, Scale, FileText,
  Upload, Plus, Trash2, Edit, ArrowRight,
  Briefcase, MessageSquare, Award, Brain, Download, Eye, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import CaseAnalysis from '../components/CaseAnalysis';

const tabs = [
  { id: 'overview', label: 'نظرة عامة', icon: User },
  { id: 'cases', label: 'القضايا', icon: Scale },
  { id: 'contract', label: 'عقد الأتعاب', icon: Briefcase },
  { id: 'documents', label: 'المستندات العامة', icon: FileText },
  { id: 'correspondence', label: 'المراسلات', icon: MessageSquare },
  { id: 'rulings', label: 'الأحكام', icon: Award },
];

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [caseModal, setCaseModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const tabCategoryMap = {
    contract: 'عقد الأتعاب',
    documents: 'المستندات العامة',
    correspondence: 'المراسلات',
    rulings: 'الأحكام والقرارات',
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clientRes, casesRes] = await Promise.all([
          clientsAPI.getClientById(id),
          casesAPI.getClientCases(id),
        ]);
        setClient(clientRes.data.client);
        setCases(casesRes.data.cases);
      } catch {
        toast.error('فشل تحميل بيانات الموكل');
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab in tabCategoryMap) {
      loadDocuments(tabCategoryMap[activeTab]);
    }
  }, [activeTab]);

  const loadDocuments = async (category) => {
    try {
      const res = await documentsAPI.getClientDocuments(id, category);
      setDocuments(res.data.documents);
    } catch {}
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) {
      toast.error('الرجاء اختيار ملف وإدخال عنوان');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('clientId', id);
      formData.append('category', tabCategoryMap[activeTab] || 'المستندات العامة');
      formData.append('title', uploadTitle);
      if (uploadDesc) formData.append('description', uploadDesc);

      await documentsAPI.uploadDocument(formData);
      toast.success('تم رفع الملف بنجاح');
      setUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      loadDocuments(tabCategoryMap[activeTab]);
    } catch {
      toast.error('فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await documentsAPI.deleteDocument(docId);
      toast.success('تم حذف الملف');
      loadDocuments(tabCategoryMap[activeTab]);
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('audio')) return '🎵';
    if (fileType?.includes('video')) return '🎬';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full spinner"></div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/clients')} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">ملف الموكل</h1>
      </div>

      {/* بطاقة معلومات الموكل */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {client.photo ? (
            <img
              src={`${API_BASE}/${client.photo}`}
              alt={client.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-600 shadow-lg"
              onError={(e) => e.target.style.display = 'none'}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {client.fullName.charAt(0)}
            </div>
          )}
          <div className="flex-1 text-center sm:text-right">
            <h2 className="text-3xl font-bold text-white mb-2">{client.fullName}</h2>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-gray-300">
              {client.phone && (
                <span className="flex items-center gap-1"><Phone size={14} className="text-amber-400" />{client.phone}</span>
              )}
              {client.email && (
                <span className="flex items-center gap-1"><Mail size={14} className="text-amber-400" />{client.email}</span>
              )}
              {client.address && (
                <span className="flex items-center gap-1"><MapPin size={14} className="text-amber-400" />{client.address}</span>
              )}
            </div>
            <div className="mt-3">
              <span className={`badge ${client.status === 'نشط' ? 'badge-success' : client.status === 'مكتمل' ? 'badge-info' : 'badge-warning'}`}>
                {client.status}
              </span>
            </div>
          </div>
          <Link to={`/clients/${id}/edit`} className="btn-secondary flex items-center gap-2 py-2">
            <Edit size={16} />
            تعديل
          </Link>
        </div>
      </div>

      {/* تبويبات الملف */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* محتوى التبويبات */}
      <div className="card">

        {/* نظرة عامة */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">المعلومات الشخصية</h3>
              <div className="space-y-3">
                {[
                  { label: 'الاسم الكامل', value: client.fullName },
                  { label: 'رقم الهوية', value: client.idNumber },
                  { label: 'الجنسية', value: client.nationality },
                  { label: 'المهنة', value: client.occupation },
                  { label: 'تاريخ الميلاد', value: client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('ar-IQ') : null },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">ملخص القضايا</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'إجمالي القضايا', value: cases.length, color: 'text-amber-400' },
                  { label: 'جارية', value: cases.filter(c => c.status === 'جارية').length, color: 'text-green-400' },
                  { label: 'مؤجلة', value: cases.filter(c => c.status === 'مؤجلة').length, color: 'text-yellow-400' },
                  { label: 'محسومة', value: cases.filter(c => c.status === 'محسومة').length, color: 'text-blue-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-700 rounded-lg p-4 text-center">
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-gray-400 text-sm mt-1">{label}</p>
                  </div>
                ))}
              </div>
              {client.notes && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">ملاحظات</p>
                  <p className="text-white">{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* القضايا */}
        {activeTab === 'cases' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">القضايا والدعاوى ({cases.length})</h3>
              <button
                onClick={() => setCaseModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                قضية جديدة
              </button>
            </div>

            {cases.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Scale size={48} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد قضايا بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((c) => (
                  <div key={c.id || c._id} className="bg-gray-700 rounded-lg p-5 border border-gray-600 hover:border-amber-600 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-white font-bold text-lg">{c.title}</h4>
                          <span className={`badge text-xs ${
                            c.status === 'جارية' ? 'badge-success' :
                            c.status === 'مؤجلة' ? 'badge-warning' :
                            c.status === 'محسومة' ? 'badge-info' : 'badge-danger'
                          }`}>{c.status}</span>
                          <span className="badge badge-primary text-xs">{c.caseType}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                          <span>رقم: <span className="text-white">{c.caseNumber}</span></span>
                          <span>المحكمة: <span className="text-white">{c.court}</span></span>
                          {c.opposingParty && <span>الطرف الآخر: <span className="text-white">{c.opposingParty}</span></span>}
                          <span>تاريخ: <span className="text-white">{new Date(c.filingDate).toLocaleDateString('ar-IQ')}</span></span>
                        </div>
                        {c.description && (
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{c.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {c.status !== 'محسومة' && (
                          <button
                            onClick={async () => {
                              if (window.confirm('هل أنت متأكد من حسم هذه القضية؟')) {
                                try {
                                  await casesAPI.updateCase(c.id || c._id, { status: 'محسومة' });
                                  toast.success('تم حسم القضية بنجاح');
                                  // تحديث القائمة محلياً
                                  setCases(prev => prev.map(caseItem => 
                                    (caseItem.id === (c.id || c._id)) ? { ...caseItem, status: 'محسومة' } : caseItem
                                  ));
                                } catch (err) {
                                  toast.error('فشل حسم القضية');
                                }
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            <CheckCircle size={14} />
                            حسم
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedCase(c); setAnalysisModal(true); }}
                          className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          <Brain size={14} />
                          تحليل AI
                        </button>
                      </div>
                    </div>
                    {c.sessions && c.sessions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">آخر جلسة: {new Date(c.sessions[c.sessions.length - 1].date).toLocaleDateString('ar-IQ')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* أقسام المستندات */}
        {activeTab in tabCategoryMap && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {tabs.find(t => t.id === activeTab)?.label} ({documents.length})
              </h3>
              <button
                onClick={() => setUploadModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Upload size={16} />
                رفع ملف
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد مستندات في هذا القسم</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id || doc._id} className="bg-gray-700 rounded-lg p-4 flex items-center gap-4 border border-gray-600 hover:border-amber-600 transition-all">
                    <span className="text-3xl">{getFileIcon(doc.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{doc.title}</p>
                      <p className="text-gray-400 text-xs">{doc.fileName}</p>
                      <p className="text-gray-500 text-xs">{formatFileSize(doc.file_size || 0)} • {new Date(doc.created_at || new Date()).toLocaleDateString('ar-IQ')}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`${API_BASE}${doc.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-gray-600 hover:bg-amber-600 text-white rounded-lg transition-colors"
                        title="عرض"
                      >
                        <Eye size={14} />
                      </a>
                      <a
                        href={`${API_BASE}${doc.filePath}`}
                        download={doc.fileName}
                        className="p-2 bg-gray-600 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        title="تحميل"
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(doc.id || doc._id)}
                        className="p-2 bg-gray-600 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* نافذة رفع ملف */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">رفع ملف جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">عنوان الملف *</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="input-field"
                  placeholder="أدخل عنوان الملف"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">ملاحظة</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  className="input-field"
                  placeholder="ملاحظة اختيارية"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">الملف *</label>
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-600 hover:border-amber-600 rounded-lg p-6 text-center transition-colors">
                    {uploadFile ? (
                      <p className="text-amber-400 font-semibold">{uploadFile.name}</p>
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                        <p className="text-gray-400">اسحب الملف هنا أو اضغط للاختيار</p>
                        <p className="text-gray-500 text-xs mt-1">PDF، صور، صوت، مستندات (حتى 50MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={e => setUploadFile(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-primary disabled:opacity-50">
                {uploading ? 'جاري الرفع...' : 'رفع'}
              </button>
              <button onClick={() => setUploadModal(false)} className="flex-1 btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة قضية جديدة */}
      {caseModal && (
        <NewCaseModal
          clientId={id}
          onClose={() => setCaseModal(false)}
          onSuccess={(newCase) => {
            setCases([newCase, ...cases]);
            setCaseModal(false);
            toast.success('تم إنشاء القضية');
          }}
        />
      )}

      {/* نافذة تحليل القضية */}
      {analysisModal && selectedCase && (
        <CaseAnalysis
          caseData={selectedCase}
          onClose={() => setAnalysisModal(false)}
        />
      )}
    </div>
  );
};

// مكون نافذة القضية الجديدة
const NewCaseModal = ({ clientId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    caseNumber: '', title: '', caseType: 'مدنية',
    court: '', opposingParty: '', description: '', filingDate: new Date().toISOString().substring(0, 10)
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.caseNumber || !form.title || !form.court || !form.filingDate) {
      toast.error('الرجاء ملء الحقول المطلوبة');
      return;
    }
    setLoading(true);
    try {
      const res = await casesAPI.createCase({ ...form, clientId });
      onSuccess(res.data.case);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full border border-gray-700 shadow-2xl overflow-y-auto max-h-screen">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Scale size={20} className="text-amber-400" />
          قضية جديدة
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-semibold">رقم القضية *</label>
              <input type="text" className="input-field" placeholder="مثال: 2024/1234" value={form.caseNumber} onChange={e => setForm({...form, caseNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-semibold">نوع القضية</label>
              <select className="input-field" value={form.caseType} onChange={e => setForm({...form, caseType: e.target.value})}>
                {['مدنية','جزائية','تجارية','أحوال شخصية','عمالية','إدارية','أخرى'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm font-semibold">عنوان القضية *</label>
            <input type="text" className="input-field" placeholder="عنوان وصفي للقضية" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-semibold">المحكمة *</label>
              <input type="text" className="input-field" placeholder="اسم المحكمة" value={form.court} onChange={e => setForm({...form, court: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-semibold">تاريخ الرفع *</label>
              <input type="date" className="input-field" value={form.filingDate} onChange={e => setForm({...form, filingDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm font-semibold">الطرف المدعى عليه</label>
            <input type="text" className="input-field" placeholder="اسم الطرف الآخر" value={form.opposingParty} onChange={e => setForm({...form, opposingParty: e.target.value})} />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm font-semibold">وصف القضية</label>
            <textarea rows={4} className="input-field resize-none" placeholder="وصف تفصيلي للقضية..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
              {loading ? 'جاري الإنشاء...' : 'إنشاء القضية'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfile;
