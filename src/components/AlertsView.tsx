import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Check,
  Trash2,
  ArrowRight,
  Filter,
  Plus,
  Sparkles,
} from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
  onResolveAlert: (id: string) => void;
  onDismissAlert: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onAddTestAlert?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onResolveAlert,
  onDismissAlert,
  onNavigateTab,
  onAddTestAlert,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterPriority === 'ALL') return true;
    return a.priority.toUpperCase() === filterPriority.toUpperCase();
  });

  const getPriorityBadge = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>REAL-TIME PROTECTION ALERTS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Security & Operational Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Practical warnings regarding payment overdue timelines, expiring legal policies, and suspicious activities.
          </p>
        </div>

        {onAddTestAlert && (
          <button
            onClick={onAddTestAlert}
            className="text-xs border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate New Alert</span>
          </button>
        )}
      </div>

      {/* Filter by Priority */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700">Filter By Urgency:</span>
        <div className="flex items-center gap-1.5">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterPriority === p
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No active alerts</h3>
          <p className="text-xs text-slate-500">
            Business Guardian is actively watching your invoices, contracts, and fraud channels.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => {
            const isResolved = alert.resolved;
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isResolved
                    ? 'border-slate-200 opacity-60 bg-slate-50/50'
                    : alert.priority === 'High'
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getPriorityBadge(
                        alert.priority
                      )}`}
                    >
                      {alert.priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                      {alert.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {alert.createdAt}
                    </span>
                    {isResolved && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Resolved
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                {/* Direct Action Triggers */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!isResolved ? (
                    <>
                      {alert.actionTab && (
                        <button
                          onClick={() => onNavigateTab(alert.actionTab!)}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{alert.actionLabel || 'Investigate'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Dismiss Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      Resolved & Logged
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
