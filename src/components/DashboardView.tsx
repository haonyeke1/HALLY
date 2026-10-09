import React from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Mail,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Bot,
  Shield,
  HelpCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  BusinessProfile,
  UserAccount,
  DashboardSummary,
  ActionItem,
  DeadlineItem,
  InvoiceItem,
  DocumentItem,
  ActivityLog,
} from '../types';

interface DashboardViewProps {
  business: BusinessProfile;
  user: UserAccount;
  summary: DashboardSummary;
  actions: ActionItem[];
  deadlines: DeadlineItem[];
  invoices: InvoiceItem[];
  documents: DocumentItem[];
  activityLogs: ActivityLog[];
  onNavigateTab: (tab: string) => void;
  onOpenUploadDoc: () => void;
  onOpenNewInvoice: () => void;
  onGenerateReminderForInvoice: (inv: InvoiceItem) => void;
  onViewDocument: (doc: DocumentItem) => void;
  onResolveAction: (actionId: string) => void;
  onRefreshData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  business,
  user,
  summary,
  actions,
  deadlines,
  invoices,
  documents,
  activityLogs,
  onNavigateTab,
  onOpenUploadDoc,
  onOpenNewInvoice,
  onGenerateReminderForInvoice,
  onViewDocument,
  onResolveAction,
  onRefreshData,
}) => {
  const urgentActions = actions.filter((a) => a.urgency === 'URGENT' && a.status === 'pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const upcomingDeadlines = deadlines.filter((d) => d.status !== 'Completed').slice(0, 5);
  const monitoredDocs = documents.slice(0, 5);

  const firstName = user.name.split(' ')[0].toUpperCase();
  const attentionCount = urgentActions.length + overdueInvoices.length;

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================= */}
      {/* HERO BANNER: THE CORE PRODUCT QUESTION & GREETING */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-700/80 shadow-lg relative overflow-hidden">
        {/* Subtle decorative grid/glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>GUARDIAN ACTIVE WATCH · {business.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              GOOD MORNING, {firstName}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-normal">
              You have <span className="font-semibold text-rose-400">{attentionCount} things</span> that need your attention today to protect your revenue and compliance.
            </p>
          </div>

          {/* Core Question Prompt Callout */}
          <div className="bg-slate-950/70 border border-slate-700/90 rounded-xl p-3.5 max-w-md shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
              <HelpCircle className="w-3.5 h-3.5" />
              Guardian Daily Directive
            </div>
            <p className="text-xs text-slate-200 mt-1 italic leading-relaxed">
              &ldquo;What can you do today to prevent losing money or missing something important?&rdquo;
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('actions')}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Review Urgent Actions</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onRefreshData}
                title="Rescan business items"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4 SUMMARY STAT CARDS (Specified in MVP brief) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Money Overdue */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Money Overdue
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${summary.moneyOverdue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">{business.currency}</span>
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 inline" />
            <span>{overdueInvoices.length} invoices require recovery</span>
          </p>
        </div>

        {/* Card 2: Urgent Actions */}
        <div
          onClick={() => onNavigateTab('actions')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Urgent Actions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.urgentActions}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Critical tasks requiring decision
          </p>
        </div>

        {/* Card 3: Deadlines This Month */}
        <div
          onClick={() => onNavigateTab('deadlines')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deadlines This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.deadlinesThisMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Renewals & due dates in October
          </p>
        </div>

        {/* Card 4: Items Monitored */}
        <div
          onClick={() => onNavigateTab('documents')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Items Monitored
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.totalMonitoredItems}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.documentsMonitored} docs · {invoices.length} invoices
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FRAUD & SCAM WATCHDOG + AI COPILOT QUICK LAUNCHERS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scam Detector Quick Banner */}
        <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-rose-900/60 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                Fraud & Scam Detector
              </span>
            </div>
            <h3 className="text-sm font-bold text-white pt-1">
              Received a suspicious wire request or payment change?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify suspicious emails, lookalike invoice PDFs, and vendor bank account changes before releasing company funds.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('scam-detector')}
            className="w-full sm:w-auto self-start px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Scan Suspicious Message</span>
          </button>
        </div>

        {/* Risk Assessment & Copilot Quick Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-900/60 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Protection Posture & Copilot
              </span>
            </div>
            <h3 className="text-sm font-bold text-white pt-1">
              Audit operational blind spots with AI Copilot
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Review cybersecurity posture, contract traps, and receive practical protection steps tailored to {business.name}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('risks')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Risk Audit (84/100)</span>
            </button>
            <button
              onClick={() => onNavigateTab('copilot')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2-COLUMN MAIN CONTENT: WIDGET PANELS 1 TO 5 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide): Urgent Actions + Overdue Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* PANEL 1: URGENT ACTIONS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  1. Urgent Actions Requiring Approval
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('actions')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <span>View All ({actions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentActions.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No urgent risks right now</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Guardian is actively monitoring your documents and receivables.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {urgentActions.map((action) => {
                  // Find related target if available
                  const relatedInvoice =
                    action.targetType === 'invoice'
                      ? invoices.find((i) => i.id === action.targetId)
                      : null;
                  const relatedDoc =
                    action.targetType === 'document'
                      ? documents.find((d) => d.id === action.targetId)
                      : null;

                  return (
                    <div
                      key={action.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wide">
                            {action.daysRemainingOrOverdue || 'Urgent'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {action.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {action.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60 font-medium">
                          <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Risk: {action.riskDescription}</span>
                        </div>
                      </div>

                      {/* Action Trigger Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {action.actionType === 'GENERATE_REMINDER' && relatedInvoice && (
                          <button
                            onClick={() => onGenerateReminderForInvoice(relatedInvoice)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Generate Reminder</span>
                          </button>
                        )}

                        {action.actionType === 'VIEW_DOCUMENT' && relatedDoc && (
                          <button
                            onClick={() => onViewDocument(relatedDoc)}
                            className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Document</span>
                          </button>
                        )}

                        <button
                          onClick={() => onResolveAction(action.id)}
                          className="text-xs border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Mark action as handled"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PANEL 3: OVERDUE INVOICES */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-600" />
                <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  3. Overdue Invoices
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <span>Invoice Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {overdueInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs text-slate-600 font-medium">All monitored invoices are up to date!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overdueInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {inv.customerName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Overdue
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Due date: {inv.dueDate}</span>
                        <span>·</span>
                        <span>Terms: {inv.paymentTerms || 'Net 30'}</span>
                        {inv.remindersSentCount ? (
                          <>
                            <span>·</span>
                            <span className="text-slate-600 font-medium">
                              {inv.remindersSentCount} reminder sent
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-slate-900">
                          ${inv.invoiceAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.currency}</div>
                      </div>

                      <button
                        onClick={() => onGenerateReminderForInvoice(inv)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-200" />
                        <span>AI Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PANEL 4: DOCUMENTS BEING MONITORED */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  4. Documents Being Monitored ({documents.length})
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenUploadDoc}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-md flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={() => onNavigateTab('documents')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  View Library
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {monitoredDocs.map((doc) => {
                const isExpiringSoon = doc.status === 'Expiring Soon';
                return (
                  <div
                    key={doc.id}
                    onClick={() => onViewDocument(doc)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                          {doc.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            isExpiringSoon
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {doc.organization || doc.type} · Ref: {doc.referenceNumber || 'N/A'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-700">
                        Expires: {doc.expiryDate || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Uploaded {doc.uploadDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col wide): Deadlines + Recent Activity */}
        <div className="space-y-6">
          {/* PANEL 2: UPCOMING DEADLINES */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  2. Upcoming Deadlines
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('deadlines')}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
              >
                Timeline
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No upcoming deadlines recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines.map((dl) => {
                  const isUrgent = dl.daysRemaining <= 7;
                  return (
                    <div key={dl.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                          {dl.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {dl.daysRemaining === 0
                            ? 'Due today'
                            : `${dl.daysRemaining}d left`}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Due: {dl.deadlineDate}</span>
                        <span className="text-slate-400">{dl.responsiblePerson}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PANEL 5: RECENT ACTIVITY LOG */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  5. Recent Activity
                </h2>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{log.details}</p>
                  <div className="text-[10px] text-slate-400">By {log.user}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Upload CTA Widget */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4.5 text-center space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Have a new contract or bill?
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Upload it to Business Guardian. Our AI automatically identifies due dates and obligations.
            </p>
            <button
              onClick={onOpenUploadDoc}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Upload Document (AI Scan)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
