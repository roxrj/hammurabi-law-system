import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clientsAPI, casesAPI, documentsAPI } from '../services/api';
import {
  Users, Scale, FileText, BarChart3,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = React.useMemo(() => null, []); // Just to avoid unused warning if needed

  useEffect(() => {
    if (user?.role === 'admin') {
      window.location.href = '/admin/lawyers';
    }
  }, [user]);

  const [stats, setStats] = useState({
    totalClients: 0,
    totalCases: 0,
    activeCases: 0,
    totalDocuments: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, clientsRes] = await Promise.all([
          documentsAPI.getStats(),
          clientsAPI.getMyClients()
        ]);
        setStats(statsRes.data.stats);
        setRecentClients(clientsRes.data.clients.slice(0, 5));
      } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'إجمالي الموكلين',
      value: stats.totalClients,
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      link: '/clients'
    },
    {
      title: 'إجمالي القضايا',
      value: stats.totalCases,
      icon: Scale,
      color: 'from-amber-600 to-amber-700',
      link: '/clients'
    },
    {
      title: 'القضايا النشطة',
      value: stats.activeCases,
      icon: TrendingUp,
      color: 'from-green-600 to-green-700',
      link: '/clients'
    },
    {
      title: 'المستندات',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'from-purple-600 to-purple-700',
      link: '/clients'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            مرحباً، {user?.fullName} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('ar-IQ', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <Link
          to="/clients/new"
          className="btn-primary flex items-center gap-2"
        >
          <Users size={18} />
          موكل جديد
        </Link>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="card hover:scale-105 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className="text-4xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${card.color} rounded-xl p-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={28} className="text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* الموكلون الأخيرون */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-amber-400" />
            آخر الموكلين
          </h2>
          <Link to="/clients" className="text-amber-400 hover:text-amber-300 text-sm">
            عرض الكل ←
          </Link>
        </div>

        {recentClients.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>لا يوجد موكلون بعد</p>
            <Link to="/clients/new" className="btn-primary inline-block mt-4">
              إضافة موكل
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>اسم الموكل</th>
                  <th>الهاتف</th>
                  <th>الحالة</th>
                  <th>تاريخ الإضافة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client) => (
                  <tr key={client.id || client._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {client.photo ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${client.photo}`}
                            alt={client.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-600"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                            {client.fullName.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-white">{client.fullName}</span>
                      </div>
                    </td>
                    <td>{client.phone}</td>
                    <td>
                      <span className={`badge ${
                        client.status === 'نشط' ? 'badge-success' :
                        client.status === 'مكتمل' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td>
                      {new Date(client.created_at || client.createdAt).toLocaleDateString('ar-IQ')}
                    </td>
                    <td>
                      <Link
                        to={`/clients/${client.id || client._id}`}
                        className="text-amber-400 hover:text-amber-300 text-sm font-semibold"
                      >
                        عرض الملف
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/contracts" className="card group hover:border-amber-600 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-amber-600 bg-opacity-20 rounded-xl p-4 group-hover:bg-opacity-40 transition-all">
              <FileText size={28} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">العقود الجاهزة</h3>
              <p className="text-gray-400 text-sm">عقود قانونية عراقية جاهزة</p>
            </div>
          </div>
        </Link>

        <Link to="/library" className="card group hover:border-amber-600 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 bg-opacity-20 rounded-xl p-4 group-hover:bg-opacity-40 transition-all">
              <Scale size={28} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">المكتبة القانونية</h3>
              <p className="text-gray-400 text-sm">القوانين والتشريعات العراقية</p>
            </div>
          </div>
        </Link>

        <Link to="/analytics" className="card group hover:border-amber-600 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 bg-opacity-20 rounded-xl p-4 group-hover:bg-opacity-40 transition-all">
              <BarChart3 size={28} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">التقارير والإحصائيات</h3>
              <p className="text-gray-400 text-sm">تحليل أداء المكتب</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
