import React, { useState } from 'react';
import { casesAPI } from '../services/api';
import { Brain, X, CheckCircle, AlertCircle, Lightbulb, FileSearch, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CaseAnalysis = ({ caseData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(caseData.aiAnalysis || null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await casesAPI.analyzeCase(caseData._id);
      setAnalysis(res.data.analysis);
      toast.success('تم تحليل القضية بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل التحليل، تحقق من مفتاح API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-gray-800 rounded-xl w-full max-w-3xl border border-purple-700 shadow-2xl flex flex-col max-h-full">
        {/* الرأس */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 rounded-lg p-2">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">تحليل القضية بالذكاء الاصطناعي</h3>
              <p className="text-gray-400 text-sm">{caseData.title} - {caseData.caseNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* معلومات القضية */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <FileSearch size={18} className="text-amber-400" />
              معلومات القضية
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-400">النوع: </span><span className="text-white">{caseData.caseType}</span></div>
              <div><span className="text-gray-400">المحكمة: </span><span className="text-white">{caseData.court}</span></div>
              <div><span className="text-gray-400">الحالة: </span><span className="text-white">{caseData.status}</span></div>
              {caseData.opposingParty && (
                <div><span className="text-gray-400">الطرف الآخر: </span><span className="text-white">{caseData.opposingParty}</span></div>
              )}
              <div><span className="text-gray-400">الجلسات: </span><span className="text-white">{caseData.sessions?.length || 0}</span></div>
            </div>
          </div>

          {/* نتائج التحليل */}
          {analysis ? (
            <>
              {/* وقت التحليل */}
              {analysis.analyzedAt && (
                <p className="text-gray-500 text-xs text-left">
                  آخر تحليل: {new Date(analysis.analyzedAt).toLocaleString('ar-IQ')}
                </p>
              )}

              {/* الملخص */}
              <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-5">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Brain size={18} className="text-purple-400" />
                  التحليل الشامل
                </h4>
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                  {analysis.summary}
                </div>
              </div>

              {/* النقاط الرئيسية */}
              {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-5">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-blue-400" />
                    النقاط القانونية الرئيسية
                  </h4>
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-200 text-sm">
                        <span className="text-blue-400 font-bold mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* التوصيات */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg p-5">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-400" />
                    التوصيات والاستراتيجيات
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-200 text-sm">
                        <span className="text-amber-400 font-bold mt-0.5">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* إعادة التحليل */}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader size={18} className="spinner" /> : <Brain size={18} />}
                {loading ? 'جاري التحليل...' : 'إعادة التحليل'}
              </button>
            </>
          ) : (
            /* حالة لم يتم التحليل بعد */
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-purple-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={40} className="text-purple-400" />
              </div>
              <h4 className="text-white font-bold text-xl mb-2">تحليل بالذكاء الاصطناعي</h4>
              <p className="text-gray-400 mb-2">سيقوم الذكاء الاصطناعي بـ:</p>
              <ul className="text-gray-300 text-sm space-y-1 mb-6">
                {[
                  'تحليل جميع معلومات القضية',
                  'استخراج النقاط القانونية الجوهرية',
                  'اقتراح استراتيجيات الدفاع',
                  'تحديد المخاطر المحتملة',
                  'تقديم توصيات قانونية شاملة'
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-center gap-2">
                    <CheckCircle size={14} className="text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 shadow-lg shadow-purple-900"
              >
                {loading ? (
                  <><Loader size={22} className="spinner" /> جاري التحليل...</>
                ) : (
                  <><Brain size={22} /> ابدأ التحليل</>
                )}
              </button>
              {loading && (
                <p className="text-gray-400 text-sm mt-4">قد يستغرق التحليل بضع ثوانٍ...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseAnalysis;
