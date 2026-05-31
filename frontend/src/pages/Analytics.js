import React, { useState, useEffect } from 'react';
import { documentsAPI, casesAPI, clientsAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, Users, Scale, FileText, TrendingUp } from 'lucide-react';

const COLORS = ['#D4A574', '#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#34d399'];

const Analytics = () => {
  const [stats, setStats] = useState({ totalClients: 0, totalCases: 0, activeCases: 0, totalDocuments: 0 });
  const [clients, setClients] = useState([]);
  const [cases, setCasesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, clientsRes] = await Promise.all([
          documentsAPI.getStats(),
          clientsAPI.getMyClients()
        ]);
        setStats(statsRes.data.stats);
        setClients(clientsRes.data.clients);

        // جلب قضايا كل موكل
        const allCases = [];
        for (const c of clientsRes.data.clients.slice(0, 10)) {
          try {
            const cRes = await casesAPI.getClientCases(c._id);
            allCases.push(...cRes.data.cases);
          } catch {}
        }
        setCasesData(allCases);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // بيانات أنواع القضايا
  const caseTypeData = cases.reduce((acc, c) => {
    const existing = acc.find(x => x.name === c.caseType);
    if (existing) existing.value++;
    else acc.push({ name: c.caseType, value: 1 });
    return acc;
  }, []);

  // بيانات حالات القضايا
  const caseStatusData = [
    { name: 'جارية', value: cases.filter(c => c.status === 'جارية').length },
    { name: 'مؤجلة', value: cases.filter(c => c.status === 'مؤجلة').length },
    { name: 'محسومة', value: cases.filter(c => c.status === 'محسومة').length },
    { name: 'مغلقة', value: cases.filter(c => c.status === 'مغلقة').length },
  ].filter(d => d.value > 0);

  // بيانات حالات الموكلين
  const clientStatusData = [
    { name: 'نشط', value: clients.filter(c => c.status === 'نشط').length },
    { name: 'غير نشط', value: clients.filter(c => c.status === 'غير نشط').length },
    { name: 'مكتمل', value: clients.filter(c => c.status === 'مكتمل').length },
  ].filter(d => d.value > 0);

  // آخر 6 أشهر - عدد الموكلين المضافين
  const monthlyClients = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('ar-IQ', { month: 'short' });
      const count = clients.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: monthName, موكلين: count });
    }
    return months;
  })();

  const statCards = [
    { title: 'إجمالي الموكلين', value: stats.totalClients, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900' },
    { title: 'إجمالي القضايا', value: stats.totalCases, icon: Scale, color: 'text-amber-400', bg: 'bg-amber-900' },
    { title: 'القضايا النشطة', value: stats.activeCases, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-900' },
    { title: 'المستندات', value: stats.totalDocuments, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-900' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
          <p className="text-white font-bold">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-amber-400" size={32} />
          الإحصائيات والتقارير
        </h1>
        <p className="text-gray-400 mt-1">تحليل شامل لأداء مكتبك القانوني</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card">
              <div className="flex items-center gap-3">
                <div className={`${card.bg} bg-opacity-40 rounded-xl p-3`}>
                  <Icon size={24} className={card.color} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* موكلون آخر 6 أشهر */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">الموكلون - آخر 6 أشهر</h3>
          {clients.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500">لا توجد بيانات بعد</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyClients}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="موكلين" fill="#D4A574" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* توزيع أنواع القضايا */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">أنواع القضايا</h3>
          {caseTypeData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500">لا توجد قضايا بعد</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {caseTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#d1d5db' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* حالات القضايا */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">حالات القضايا</h3>
          {caseStatusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500">لا توجد قضايا بعد</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={caseStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} name="عدد القضايا" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* حالات الموكلين */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-6">حالات الموكلين</h3>
          {clientStatusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500">لا يوجد موكلون بعد</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={clientStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#6b7280' }}
                >
                  {clientStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ملخص نصي */}
      <div className="card border-amber-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-amber-400" />
          ملخص الأداء
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 mb-1">نسبة القضايا النشطة</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.totalCases > 0 ? Math.round((stats.activeCases / stats.totalCases) * 100) : 0}%
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 mb-1">متوسط القضايا لكل موكل</p>
            <p className="text-2xl font-bold text-amber-400">
              {stats.totalClients > 0 ? (stats.totalCases / stats.totalClients).toFixed(1) : 0}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 mb-1">متوسط الملفات لكل موكل</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.totalClients > 0 ? (stats.totalDocuments / stats.totalClients).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
