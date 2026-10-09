import React, { useState } from 'react';
import {
  ListTodo,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Mail,
  Eye,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ActionItem, InvoiceItem, DocumentItem } from '../types';

interface ActionCenterViewProps {
  actions: ActionItem[];
  invoices: InvoiceItem[];
  documents: DocumentItem[];
  onGenerateReminderForInvoice: (inv: InvoiceItem) => void;
  onViewDocument: (doc: DocumentItem) => void;
  onResolveAction: (actionId: string) => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  actions,
  invoices,
  documents,
  onGenerateReminderForInvoice,
  onViewDocument,
  onResolveAction,
}) => {
  const [activeTab, setActiveTab] = useState<
    'URGENT' | 'TODAY' | 'THIS WEEK' | 'UPCOMING' | 'COMPLETED'
  >('URGENT');

  const tabCounts = {
    URGENT: actions.filter((a) => a.urgency === 'URGENT' && a.status === 'pending').length,
    TODAY: actions.filter((a) => a.urgency === 'TODAY' && a.status === 'pending').length,
    'THIS WEEK': actions.filter((a) => a.urgency === 'THIS WEEK' && a.status === 'pending').length,
    UPCOMING: actions.filter((a) => a.urgency === 'UPCOMING' && a.status === 'pending').length,
    COMPLETED: actions.filter((a) => a.status === 'resolved' || a.urgency === 'COMPLETED').length,
  };

  const filteredActions = actions.filter((a) => {
    if (activeTab === 'COMPLETED') {
      return a.status === 'resolved' || a.urgency === 'COMPLETED';
    }
    return a.urgency === activeTab && a.status === 'pending';
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>GUARDIAN RECOMMENDED ACTIONS</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Action Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Business Guardian identifies risks before they become expensive problems. Review and authorize preventive actions below.
        </p>
      </div>

      {/* Tabs (URGENT, TODAY, THIS WEEK, UPCOMING, COMPLETED) */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {(['URGENT', 'TODAY', 'THIS WEEK', 'UPCOMING', 'COMPLETED'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? tab === 'URGENT'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab === 'URGENT' && count > 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Items List */}
      {filteredActions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">
            {activeTab === 'COMPLETED' ? 'No completed actions yet' : `No ${activeTab.toLowerCase()} items!`}
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'COMPLETED'
              ? 'Actions you resolve will appear here with an audit timestamp.'
              : 'All monitored items in this timeframe are currently stable.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredActions.map((act) => {
            const relatedInvoice =
              act.targetType === 'invoice' ? invoices.find((i) => i.id === act.targetId) : null;
            const relatedDoc =
              act.targetType === 'document' ? documents.find((d) => d.id === act.targetId) : null;

            const isUrgent = act.urgency === 'URGENT';
            const isResolved = act.status === 'resolved' || act.urgency === 'COMPLETED';

            return (
              <div
                key={act.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUrgent && !isResolved
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2 max-w-2xl">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800'
                          : act.urgency === 'TODAY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {act.daysRemainingOrOverdue || act.urgency}
                    </span>

                    {act.amount ? (
                      <span className="font-mono text-xs font-bold text-slate-800">
                        ${act.amount.toLocaleString()} USD
                      </span>
                    ) : null}

                    {isResolved && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Resolved
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Risk Callout (Why it matters) */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Preventable Loss Risk:</span>{' '}
                      <span className="text-slate-600">{act.riskDescription}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Triggers */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!isResolved ? (
                    <>
                      {act.actionType === 'GENERATE_REMINDER' && relatedInvoice && (
                        <button
                          onClick={() => onGenerateReminderForInvoice(relatedInvoice)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Generate Reminder</span>
                        </button>
                      )}

                      {(act.actionType === 'VIEW_DOCUMENT' || act.actionType === 'REVIEW_CONTRACT') &&
                        relatedDoc && (
                          <button
                            onClick={() => onViewDocument(relatedDoc)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Document</span>
                          </button>
                        )}

                      <button
                        onClick={() => onResolveAction(act.id)}
                        className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                        title="Mark as handled"
                      >
                        Acknowledge / Done
                      </button>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium">
                      Action logged & archived
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
