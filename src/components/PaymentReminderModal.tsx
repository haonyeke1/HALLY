import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Sparkles,
  Copy,
  Check,
  Send,
  Calendar,
  Clock,
  AlertCircle,
  HelpCircle,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { InvoiceItem, BusinessProfile } from '../types';
import { api } from '../services/api';

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItem | null;
  business: BusinessProfile;
  onReminderSent: (result: { invoiceId: string; message: string }) => void;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  isOpen,
  onClose,
  invoice,
  business,
  onReminderSent,
}) => {
  const [tone, setTone] = useState<'friendly' | 'firm' | 'urgent'>('friendly');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recommendedNextAction, setRecommendedNextAction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('2026-10-12');
  const [notificationFeedback, setNotificationFeedback] = useState('');

  // Calculate days overdue
  const today = new Date('2026-10-08');
  let daysOverdue = 0;
  if (invoice?.dueDate) {
    const due = new Date(invoice.dueDate);
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    daysOverdue = Math.max(0, diff);
  }

  // Auto-generate reminder when opened or tone changes
  useEffect(() => {
    if (isOpen && invoice) {
      generateReminder(tone);
    }
  }, [isOpen, invoice, tone]);

  const generateReminder = async (selectedTone: 'friendly' | 'firm' | 'urgent') => {
    if (!invoice) return;
    setIsGenerating(true);
    setNotificationFeedback('');

    try {
      const res = await api.generatePaymentReminder({
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        amount: invoice.invoiceAmount,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        daysOverdue,
        tone: selectedTone,
        senderName: business.ownerName,
        businessName: business.name,
        notes: invoice.notes,
      });

      if (res.reminder) {
        setSubject(res.reminder.subject);
        setBody(res.reminder.body);
        setRecommendedNextAction(res.reminder.recommendedNextAction);
      }
    } catch (err) {
      console.error('Failed to generate reminder:', err);
      // Graceful standard template
      setSubject(`Payment reminder for Invoice ${invoice.invoiceNumber}`);
      setBody(
        `Dear ${invoice.customerName},\n\nI hope you are well.\n\nThis is a friendly reminder that Invoice ${invoice.invoiceNumber} for $${invoice.invoiceAmount.toLocaleString()} was due on ${invoice.dueDate}.\n\nPlease let us know if payment has already been processed or if you need an updated copy of the invoice.\n\nThank you,\n${business.ownerName}\n${business.name}`
      );
      setRecommendedNextAction('Send reminder today and follow up in 5 business days.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !invoice) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendOrSchedule = async () => {
    setIsSending(true);
    try {
      const res = await api.sendReminder({
        invoiceId: invoice.id,
        recipientEmail: invoice.customerEmail,
        subject,
        body,
        scheduledDate: scheduleMode ? scheduledDate : undefined,
      });

      if (res.success) {
        onReminderSent({
          invoiceId: invoice.id,
          message: res.message,
        });
        onClose();
      }
    } catch (err) {
      console.error(err);
      setNotificationFeedback('Failed to process reminder action.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                AI Payment Reminder Engine
              </h2>
              <p className="text-xs text-slate-400">
                Crafting professional recovery email for {invoice.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Invoice Summary Ribbon */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500">Invoice:</span>{' '}
              <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-slate-500">Amount:</span>{' '}
              <span className="font-bold text-emerald-700">
                ${invoice.invoiceAmount.toLocaleString()} {invoice.currency}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Due: {invoice.dueDate}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                {daysOverdue > 0 ? `${daysOverdue} days overdue` : 'Due today'}
              </span>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Reminder Tone (Choose communication posture):
              </label>
              {isGenerating && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Regenerating with Gemini...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTone('friendly')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  tone === 'friendly'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Friendly & Warm
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  First friendly nudge
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTone('firm')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  tone === 'firm'
                    ? 'border-amber-500 bg-amber-50/80 text-amber-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Firm & Professional
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  10+ days overdue
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTone('urgent')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  tone === 'urgent'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Urgent & Formal
                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                  Formal settlement notice
                </span>
              </button>
            </div>
          </div>

          {/* Email Subject Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Email Body Field (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Email Message Body (Editable)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* Recommended Next Action Callout */}
          {recommendedNextAction && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950">Guardian Recommended Strategy:</span>{' '}
                <span className="text-emerald-800">{recommendedNextAction}</span>
              </div>
            </div>
          )}

          {/* Schedule or Send Controls */}
          {scheduleMode ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  Schedule Delivery Date
                </span>
                <button
                  type="button"
                  onClick={() => setScheduleMode(false)}
                  className="text-[11px] text-blue-700 hover:underline font-semibold"
                >
                  Switch to Send Now
                </button>
              </div>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="text-xs p-2 rounded-lg border border-blue-300 bg-white"
              />
              <p className="text-[11px] text-blue-700">
                Guardian will schedule this reminder to trigger if payment has not been marked as received by {scheduledDate}.
              </p>
            </div>
          ) : null}

          {/* Anti-Slop / Safety Notice */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong>Guardian Safety Rule:</strong> Payment reminders are never dispatched automatically without your explicit review and confirmation.
            </span>
          </div>

          {notificationFeedback && (
            <div className="text-xs text-rose-600">{notificationFeedback}</div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!scheduleMode && (
              <button
                type="button"
                onClick={() => setScheduleMode(true)}
                className="text-xs text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-100 font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Schedule for Later</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendOrSchedule}
              disabled={isSending || isGenerating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {scheduleMode ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>
                {isSending
                  ? 'Processing...'
                  : scheduleMode
                  ? 'Schedule Reminder'
                  : 'Send Reminder Email'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
