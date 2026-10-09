import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { RiskAssessmentView } from './components/RiskAssessmentView';
import { ScamDetectorView } from './components/ScamDetectorView';
import { AlertsView } from './components/AlertsView';
import { CopilotView } from './components/CopilotView';
import { InvoicesView } from './components/InvoicesView';
import { DocumentsView } from './components/DocumentsView';
import { DeadlinesView } from './components/DeadlinesView';
import { ActionCenterView } from './components/ActionCenterView';
import { CalendarView } from './components/CalendarView';
import { PricingView } from './components/PricingView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { PaymentReminderModal } from './components/PaymentReminderModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuthModal } from './components/AuthModal';
import { api, AppDataResponse } from './services/api';
import {
  auth,
  signOut,
  onAuthStateChanged,
  testFirestoreConnection,
  FirebaseUser,
} from './firebase';
import {
  BusinessProfile,
  UserAccount,
  DashboardSummary,
  InvoiceItem,
  DocumentItem,
  DeadlineItem,
  ActionItem,
  NotificationItem,
  ActivityLog,
  RiskAssessmentItem,
  AlertItem,
  ScamCheckItem,
  CopilotMessage,
} from './types';
import { AlertCircle, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

export default function App() {
  // Mode: 'app' (SaaS application) or 'landing' (Public marketing landing page)
  const [viewMode, setViewMode] = useState<'app' | 'landing'>('app');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // App data state
  const [business, setBusiness] = useState<BusinessProfile>({
    id: 'biz_brightpath_01',
    name: 'BrightPath Consulting',
    businessType: 'Management Consulting',
    country: 'United States',
    currency: 'USD',
    timeZone: 'America/New_York (EST)',
    ownerName: 'Sarah Jenkins',
    email: 'sarah.jenkins@brightpathconsulting.com',
    monitoredItemCount: 27,
  });

  const [user, setUser] = useState<UserAccount>({
    id: 'usr_sarah_01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@brightpathconsulting.com',
    role: 'Managing Principal',
    businessId: 'biz_brightpath_01',
    plan: 'business',
    createdAt: '2026-01-15T09:00:00Z',
  });

  const [summary, setSummary] = useState<DashboardSummary>({
    moneyOverdue: 8420,
    totalOutstanding: 20720,
    urgentActions: 3,
    deadlinesThisMonth: 5,
    documentsMonitored: 5,
    totalMonitoredItems: 27,
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<any>({
    emailAlertsEnabled: true,
    invoiceOverdueAlerts: true,
    documentExpiryAlerts: true,
    upcomingDeadlinesAlerts: true,
    dailyMorningDigest: true,
    alertEmail: 'sarah.jenkins@brightpathconsulting.com',
  });

  // Protection & AI State
  const [risks, setRisks] = useState<RiskAssessmentItem[]>([
    {
      id: 'risk_01',
      userId: 'usr_sarah_01',
      category: 'Fraud & Scams',
      title: 'Unverified Vendor Payment Routing Request',
      severity: 'Critical',
      status: 'Open',
      impact: 'Supplier email account compromise could redirect $14,500 wire transfer to a fraudulent account.',
      recommendation: 'Enforce dual verbal verification over a known, verified telephone number before updating ACH/wire info.',
      createdAt: 'Today, 8:12 AM',
    },
    {
      id: 'risk_02',
      userId: 'usr_sarah_01',
      category: 'Legal & Compliance',
      title: 'Commercial General Liability Policy Expires in 7 Days',
      severity: 'High',
      status: 'Open',
      impact: 'Lapse in coverage breaches active client MSAs and exposes founders to personal liability.',
      recommendation: 'Authorize policy renewal premium with Hartford Mutual before October 15 cutoff.',
      createdAt: 'Oct 6, 2026',
    },
    {
      id: 'risk_03',
      userId: 'usr_sarah_01',
      category: 'Financial',
      title: 'High Receivables Aging: $8,420 Overdue Across 2 Accounts',
      severity: 'Medium',
      status: 'Open',
      impact: 'Delayed cash collection strains operating liquidity and working capital.',
      recommendation: 'Deploy Guardian AI payment reminders with escalating tone to Apex Global and Horizon Media.',
      createdAt: 'Oct 4, 2026',
    },
    {
      id: 'risk_04',
      userId: 'usr_sarah_01',
      category: 'Cybersecurity',
      title: 'Shared Team Credentials on Cloud SaaS Platforms',
      severity: 'Medium',
      status: 'Open',
      impact: 'Lack of individual audit logs increases insider leak and credential harvesting exposure.',
      recommendation: 'Implement individual single-sign-on (SSO) and mandatory authenticator app 2FA.',
      createdAt: 'Sep 28, 2026',
    },
  ]);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert_01',
      userId: 'usr_sarah_01',
      title: 'Suspicious Bank Wire Change Email Flagged',
      message: 'Urgent email requesting routing update for invoice #INV-8891 flagged with 92% fraud risk score.',
      type: 'fraud',
      priority: 'High',
      actionLabel: 'Verify Scam',
      actionTab: 'scam-detector',
      read: false,
      resolved: false,
      createdAt: 'Today, 9:20 AM',
    },
    {
      id: 'alert_02',
      userId: 'usr_sarah_01',
      title: 'Commercial Liability Policy Expires in 7 Days',
      message: 'Hartford policy POL-CGL-8849102 expires on October 15. Grace period ends soon.',
      type: 'expiry',
      priority: 'High',
      actionLabel: 'Review Policy',
      actionTab: 'documents',
      read: false,
      resolved: false,
      createdAt: 'Today, 8:00 AM',
    },
    {
      id: 'alert_03',
      userId: 'usr_sarah_01',
      title: 'Apex Global Invoice #1042 is 18 Days Overdue',
      message: 'Unsettled receivable ($2,400 USD). Ready to generate professional follow-up reminder.',
      type: 'overdue',
      priority: 'Medium',
      actionLabel: 'Send Reminder',
      actionTab: 'invoices',
      read: false,
      resolved: false,
      createdAt: 'Yesterday, 4:15 PM',
    },
  ]);

  const [scamChecks, setScamChecks] = useState<ScamCheckItem[]>([]);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg_initial',
      role: 'assistant',
      text: 'Good morning, Sarah. I am Business Guardian Copilot. I actively monitor your contracts, invoices, and supplier communications for fraud, scams, and compliance risks. How can I protect BrightPath Consulting today?',
      createdAt: 'Today, 8:00 AM',
    },
  ]);

  // Modal open states
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<InvoiceItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch full application state & test Firestore connection
  const loadData = async () => {
    try {
      await testFirestoreConnection();
      const data: AppDataResponse = await api.getAppData();
      setBusiness(data.business);
      setUser(data.user);
      setSummary(data.summary);
      setDocuments(data.documents);
      setInvoices(data.invoices);
      setDeadlines(data.deadlines);
      setActions(data.actions);
      setNotifications(data.notifications);
      setActivityLogs(data.activityLogs);
      if (data.notificationSettings) {
        setNotificationSettings(data.notificationSettings);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setIsLoggedIn(true);
        setUser((prev) => ({
          ...prev,
          id: fbUser.uid,
          name: fbUser.displayName || prev.name,
          email: fbUser.email || prev.email,
        }));
      }
    });

    loadData();
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenReminderForInvoice = (inv: InvoiceItem) => {
    setSelectedInvoiceForReminder(inv);
    setIsReminderModalOpen(true);
  };

  const handleViewDocumentFromAction = (doc: DocumentItem) => {
    setCurrentTab('documents');
  };

  const handleResolveAction = async (actionId: string) => {
    try {
      await api.resolveAction(actionId);
      showToast('Action item resolved and archived.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocumentSaved = (newDoc: DocumentItem) => {
    showToast(`"${newDoc.name}" added to Guardian Watch!`);
    loadData();
  };

  const handleReminderSent = (res: { invoiceId: string; message: string }) => {
    showToast(res.message);
    loadData();
  };

  const handleSelectPlan = (plan: 'free' | 'starter' | 'business' | 'pro') => {
    setUser((prev) => ({ ...prev, plan }));
    showToast(`Switched to ${plan.toUpperCase()} tier.`);
  };

  const handleResetDemoData = async () => {
    try {
      await api.resetDemoData();
      showToast('Reset to BrightPath Consulting benchmark sample data.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearData = async () => {
    try {
      await api.clearData();
      setRisks([]);
      setAlerts([]);
      showToast('Cleared to fresh empty state.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (name: string, email: string, bizName?: string) => {
    setIsLoggedIn(true);
    setUser((prev) => ({ ...prev, name, email }));
    if (bizName) {
      setBusiness((prev) => ({ ...prev, name: bizName, ownerName: name, email }));
    }
    showToast(`Welcome, ${name}!`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    setIsLoggedIn(false);
    showToast('Signed out of Business Guardian.', 'info');
  };

  const handleMitigateRisk = (riskId: string) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === riskId ? { ...r, status: 'Mitigated' } : r))
    );
    showToast('Risk successfully mitigated!');
  };

  const handleAddRisk = (newRisk: RiskAssessmentItem) => {
    setRisks((prev) => [newRisk, ...prev]);
    showToast('New risk item recorded.');
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true, read: true } : a))
    );
    showToast('Alert resolved and archived.');
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast('Alert dismissed.');
  };

  const handleCreateAlert = (title: string, message: string, priority: 'High' | 'Medium' | 'Low') => {
    const newAlert: AlertItem = {
      id: `alert_${Date.now()}`,
      userId: user.id,
      title,
      message,
      type: 'fraud',
      priority,
      read: false,
      resolved: false,
      createdAt: 'Just now',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleSaveScamCheck = (check: ScamCheckItem) => {
    setScamChecks((prev) => [check, ...prev]);
    showToast('Scam forensic check saved.');
  };

  const handleSendCopilotMessage = (msg: CopilotMessage) => {
    setCopilotMessages((prev) => [...prev, msg]);
  };

  // Global search result selection
  const handleSearchSelectItem = (type: string, item: any) => {
    if (type === 'invoice') {
      setCurrentTab('invoices');
    } else if (type === 'document') {
      setCurrentTab('documents');
    } else if (type === 'deadline') {
      setCurrentTab('deadlines');
    } else if (type === 'action') {
      setCurrentTab('actions');
    }
  };

  // Calculated urgent and overdue counts for navbar badges
  const urgentCount = actions.filter((a) => a.urgency === 'URGENT' && a.status === 'pending').length;
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;
  const unreadAlertsCount = alerts.filter((a) => !a.resolved && !a.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="text-center">
          <div className="text-sm font-bold tracking-tight">BUSINESS GUARDIAN AI</div>
          <div className="text-xs text-slate-400 mt-1">Starting active monitoring engine & Firebase...</div>
        </div>
      </div>
    );
  }

  // If user chooses to view the Public Landing Page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onEnterDashboard={() => setViewMode('app')}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        business={business}
        user={user}
        urgentCount={urgentCount}
        overdueCount={overdueCount}
        unreadNotifsCount={unreadAlertsCount}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenUploadDoc={() => setIsUploadDocOpen(true)}
        onOpenNewInvoice={() => setCurrentTab('invoices')}
        onOpenNewDeadline={() => setCurrentTab('deadlines')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchToLanding={() => setViewMode('landing')}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            business={business}
            user={user}
            summary={summary}
            actions={actions}
            deadlines={deadlines}
            invoices={invoices}
            documents={documents}
            activityLogs={activityLogs}
            onNavigateTab={setCurrentTab}
            onOpenUploadDoc={() => setIsUploadDocOpen(true)}
            onOpenNewInvoice={() => setCurrentTab('invoices')}
            onGenerateReminderForInvoice={handleOpenReminderForInvoice}
            onViewDocument={handleViewDocumentFromAction}
            onResolveAction={handleResolveAction}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'risks' && (
          <RiskAssessmentView
            risks={risks}
            business={business}
            onMitigateRisk={handleMitigateRisk}
            onAddRisk={handleAddRisk}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'scam-detector' && (
          <ScamDetectorView
            onSaveScamCheck={handleSaveScamCheck}
            onCreateAlert={handleCreateAlert}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
            onNavigateTab={setCurrentTab}
            onAddTestAlert={() =>
              handleCreateAlert(
                'Simulated Wire Modification Attempt',
                'Unrecognized IBAN change request detected from spoofed vendor domain.',
                'High'
              )
            }
          />
        )}

        {currentTab === 'copilot' && (
          <CopilotView
            business={business}
            messages={copilotMessages}
            onSendMessage={handleSendCopilotMessage}
          />
        )}

        {currentTab === 'actions' && (
          <ActionCenterView
            actions={actions}
            invoices={invoices}
            documents={documents}
            onGenerateReminderForInvoice={handleOpenReminderForInvoice}
            onViewDocument={handleViewDocumentFromAction}
            onResolveAction={handleResolveAction}
          />
        )}

        {currentTab === 'invoices' && (
          <InvoicesView
            invoices={invoices}
            business={business}
            onGenerateReminder={handleOpenReminderForInvoice}
            onInvoiceCreated={() => {
              showToast('Invoice created and under Guardian watch!');
              loadData();
            }}
            onInvoiceUpdated={() => {
              showToast('Invoice updated successfully.');
              loadData();
            }}
            onInvoiceDeleted={() => {
              showToast('Invoice removed.');
              loadData();
            }}
            onOpenUploadDoc={() => setIsUploadDocOpen(true)}
          />
        )}

        {currentTab === 'documents' && (
          <DocumentsView
            documents={documents}
            onOpenUploadModal={() => setIsUploadDocOpen(true)}
            onDocumentDeleted={() => {
              showToast('Document removed from monitoring.');
              loadData();
            }}
          />
        )}

        {currentTab === 'deadlines' && (
          <DeadlinesView
            deadlines={deadlines}
            business={business}
            onDeadlineCreated={() => {
              showToast('New deadline scheduled.');
              loadData();
            }}
            onDeadlineUpdated={() => {
              showToast('Deadline updated.');
              loadData();
            }}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            invoices={invoices}
            documents={documents}
            deadlines={deadlines}
          />
        )}

        {currentTab === 'pricing' && (
          <PricingView
            user={user}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            business={business}
            user={user}
            onUpdateBusiness={(newBiz) => {
              setBusiness(newBiz);
              showToast('Business details updated.');
            }}
            onUpdateUser={(newUser) => {
              setUser(newUser);
              showToast('User profile updated.');
            }}
            onResetDemoData={handleResetDemoData}
            onClearData={handleClearData}
          />
        )}

        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">BUSINESS GUARDIAN AI</span>
            <span>—</span>
            <span>Global business protection & fraud prevention assistant.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setViewMode('landing')}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Public Landing Page
            </button>
            <button
              onClick={() => setCurrentTab('scam-detector')}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Scam Detector
            </button>
            <button
              onClick={() => setCurrentTab('copilot')}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              AI Copilot
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Admin Metrics
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <DocumentUploadModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        onDocumentSaved={handleDocumentSaved}
      />

      <PaymentReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedInvoiceForReminder(null);
        }}
        invoice={selectedInvoiceForReminder}
        business={business}
        onReminderSent={handleReminderSent}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={documents}
        invoices={invoices}
        deadlines={deadlines}
        actions={actions}
        onSelectItem={handleSearchSelectItem}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        settings={notificationSettings}
        onSettingsUpdated={(s) => {
          setNotificationSettings(s);
          showToast('Notification settings saved.');
        }}
        onMarkAllRead={async () => {
          await api.markAllNotificationsRead();
          loadData();
        }}
        onNavigateTab={setCurrentTab}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
