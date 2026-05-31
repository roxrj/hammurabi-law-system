import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('u');
    if (userParam) {
      setUsername(userParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/dashboard');
      } else {
        toast.error('بيانات الدخول غير صحيحة');
      }
    } catch (error) {
      toast.error('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* الرأس */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-4 shadow-lg">
              <span className="text-4xl font-bold text-white">⚖️</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">حمورابي</h1>
          <p className="text-gray-400 text-lg">نظام إدارة المكاتب القانونية</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="أدخل اسم المستخدم"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="أدخل كلمة المرور"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg flex gap-3">
            <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">بيانات اختبار:</p>
              <p>اسم المستخدم: admin</p>
              <p>كلمة المرور: admin123</p>
            </div>
          </div>
        </div>

        {/* التذييل */}
        <p className="text-center text-gray-500 text-sm mt-8">
          نظام حمورابي © 2024 - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};

export default Login;
