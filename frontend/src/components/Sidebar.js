import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Scale
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let menuItems = [];

  if (user?.role === 'admin') {
    menuItems = [
      {
        label: 'إدارة المحامين',
        path: '/admin/lawyers',
        icon: Users
      }
    ];
  } else {
    menuItems = [
      {
        label: 'لوحة التحكم',
        path: '/dashboard',
        icon: Home
      },
      {
        label: 'الموكلين',
        path: '/clients',
        icon: Users
      },
      {
        label: 'الإحصائيات',
        path: '/analytics',
        icon: BarChart3
      },
    ];
  }

  return (
    <>
      {/* زر القائمة على الأجهزة الصغيرة */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-600 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 
          border-l border-gray-700 transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* الرأس */}
        <div className="p-6 border-b border-gray-700">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-2">
              <Scale size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">حمورابي</h1>
              <p className="text-xs text-gray-400">نظام إدارة قانوني</p>
            </div>
          </Link>
        </div>

        {/* القائمة */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-amber-600 hover:text-white rounded-lg transition-all duration-200 group"
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* بيانات المستخدم والخروج */}
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1">المستخدم الحالي</p>
            <p className="text-white font-semibold truncate">{user?.fullName}</p>
            <p className="text-xs text-amber-400 mt-1">
              {user?.role === 'admin' ? 'مدير النظام' : 'محامي'}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Overlay على الأجهزة الصغيرة */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
