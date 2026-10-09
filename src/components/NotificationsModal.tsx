import React, { useState } from 'react';
import {
  Bell,
  X,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Settings,
  Shield,
  Check,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  settings: {
    emailAlertsEnabled: boolean;
    invoiceOverdueAlerts: boolean;
    documentExpiryAlerts: boolean;
    upcomingDeadlinesAlerts: boolean;
    dailyMorningDigest: boolean;
    alertEmail: string;
  };
  onSettingsUpdated: (newSettings: any) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  settings,
  onSettingsUpdated,
  onMarkAllRead,
  onNavigateTab,
}) => {
  const [activeView, setActiveView] = useState<'list' | 'settings'>('list');
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.updateNotificationSettings(localSettings);
      onSettingsUpdated(localSettings);
      setActiveView('list');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'invoice_overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'document_expiry':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'reminder_generated':
        return <Mail className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-xs p-4 pt-16 sm:pt-20 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm">
              {activeView === 'list' ? 'Guardian Notification Feed' : 'Email Alert Preferences'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'list' ? 'settings' : 'list')}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{activeView === 'list' ? 'Preferences' : 'Feed'}</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeView === 'list' ? (
          <div>
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {notifications.filter((n) => !n.read).length} unread updates
              </span>
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No notifications at this time.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.linkTab) {
                        onNavigateTab(notif.linkTab);
                        onClose();
                      }
                    }}
                    className={`p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                      !notif.read ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="space-y-1 grow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{notif.title}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {notif.createdAt}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Email Preferences Form (Per Spec Section I) */
          <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Business Guardian sends timely alert emails so you never miss an invoice or document deadline.
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={localSettings.alertEmail}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, alertEmail: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.emailAlertsEnabled}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, emailAlertsEnabled: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-bold text-slate-800">
                  Master Switch: Enable Email Notifications
                </span>
              </label>

              <div className="pl-6 space-y-2.5 border-l-2 border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.invoiceOverdueAlerts}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        invoiceOverdueAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700">Invoices becoming overdue</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.documentExpiryAlerts}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        documentExpiryAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700">
                    Document expiry & renewal cutoff windows (60, 30, 14, 7, 1d)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.upcomingDeadlinesAlerts}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        upcomingDeadlinesAlerts: e.target.checked,
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700">Scheduled custom deadlines</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.dailyMorningDigest}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        dailyMorningDigest: e.target.checked,
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700">
                    Daily Morning Guardian Directive & Briefing
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-3 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
              >
                {isSavingSettings ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
