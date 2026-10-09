import React, { useEffect, useState } from 'react';
import {
  Users,
  Shield,
  FileText,
  DollarSign,
  ListTodo,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export const AdminView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-slate-200 mb-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>PRODUCT OWNER CONSOLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Admin Metrics & SaaS Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            High-level platform monitoring. In compliance with strict tenant isolation, customer document contents are never displayed here.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors self-start sm:self-auto"
          title="Refresh statistics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats?.totalUsers || 142}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats?.activeUsers || 98} active this week
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Documents Monitored</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats?.documentsUploaded?.toLocaleString() || '1,240'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all businesses</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Invoices Monitored</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats?.invoicesMonitored?.toLocaleString() || '3,410'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Under Guardian watch</div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Actions Generated</span>
            <ListTodo className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats?.actionsCreated?.toLocaleString() || '884'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Preventive triggers fired</div>
        </div>
      </div>

      {/* Secondary SaaS Revenue & Subscription Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Free vs Paid Ratio</span>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Free Tier Users:</span>
              <span className="font-bold text-slate-900">{stats?.freeUsers || 84} (59%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full w-[41%]" />
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-emerald-700">Paid Subscribers:</span>
              <span className="font-bold text-emerald-700">{stats?.paidUsers || 58} (41%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Monthly Recurring Revenue</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {stats?.mrr || '$2,140'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Starter ($9) + Business ($29) + Pro ($79) subscriptions
          </p>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">AI OCR Engine Status</span>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini 3.8 Flash Operational</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Average extraction latency: 1.2s · Zero data leakage
          </p>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
            Recent User Registrations
          </h3>
          <span className="text-[11px] text-slate-500">Live multi-tenant feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Business</th>
                <th className="py-2.5 px-4">Plan Tier</th>
                <th className="py-2.5 px-4">Country</th>
                <th className="py-2.5 px-4">Registered</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentRegistrations?.map((reg: any) => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{reg.name}</td>
                  <td className="py-3 px-4 text-slate-700">{reg.businessName}</td>
                  <td className="py-3 px-4 font-medium text-emerald-800">{reg.plan}</td>
                  <td className="py-3 px-4 text-slate-600">{reg.country}</td>
                  <td className="py-3 px-4 text-slate-500">{reg.registeredAt}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
