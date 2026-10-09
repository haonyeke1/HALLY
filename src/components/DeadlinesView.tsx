import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  User,
  Trash2,
  Check,
  Tag,
  Sparkles,
  X,
  Bell,
} from 'lucide-react';
import { DeadlineItem, BusinessProfile } from '../types';
import { api } from '../services/api';

interface DeadlinesViewProps {
  deadlines: DeadlineItem[];
  business: BusinessProfile;
  onDeadlineCreated: (dl: DeadlineItem) => void;
  onDeadlineUpdated: () => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  deadlines,
  business,
  onDeadlineCreated,
  onDeadlineUpdated,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // New Deadline form state
  const [form, setForm] = useState({
    title: '',
    category: 'Other' as DeadlineItem['category'],
    deadlineDate: '',
    responsiblePerson: business.ownerName,
    priority: 'High' as DeadlineItem['priority'],
    reminderSchedule: [60, 30, 14, 7, 1],
  });
  const [customDays, setCustomDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleScheduleDay = (day: number) => {
    if (form.reminderSchedule.includes(day)) {
      setForm({
        ...form,
        reminderSchedule: form.reminderSchedule.filter((d) => d !== day),
      });
    } else {
      setForm({
        ...form,
        reminderSchedule: [...form.reminderSchedule, day].sort((a, b) => b - a),
      });
    }
  };

  const handleAddCustomDay = () => {
    const val = parseInt(customDays, 10);
    if (!isNaN(val) && val > 0 && !form.reminderSchedule.includes(val)) {
      setForm({
        ...form,
        reminderSchedule: [...form.reminderSchedule, val].sort((a, b) => b - a),
      });
      setCustomDays('');
    }
  };

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadlineDate) return;

    setIsSubmitting(true);
    try {
      const today = new Date('2026-10-08');
      const target = new Date(form.deadlineDate);
      const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const res = await api.createDeadline({
        title: form.title,
        category: form.category,
        deadlineDate: form.deadlineDate,
        daysRemaining: Math.max(0, diffDays),
        responsiblePerson: form.responsiblePerson,
        priority: form.priority,
        reminderSchedule: form.reminderSchedule,
      });

      if (res.success) {
        onDeadlineCreated(res.deadline);
        setIsAddModalOpen(false);
        setForm({
          title: '',
          category: 'Other',
          deadlineDate: '',
          responsiblePerson: business.ownerName,
          priority: 'High',
          reminderSchedule: [60, 30, 14, 7, 1],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (dl: DeadlineItem) => {
    try {
      await api.completeDeadline(dl.id, dl.title);
      onDeadlineUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this scheduled deadline?')) {
      try {
        await api.deleteDeadline(id);
        onDeadlineUpdated();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredDeadlines = deadlines.filter((d) => {
    if (filterPriority === 'ALL') return true;
    return d.priority.toUpperCase() === filterPriority.toUpperCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Central Deadline Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Guardian actively fires reminders at 60, 30, 14, 7, and 1 days before critical obligations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Deadline</span>
        </button>
      </div>

      {/* Priority Filter */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700">Filter Priority:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((pr) => (
            <button
              key={pr}
              onClick={() => setFilterPriority(pr)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterPriority === pr
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines List */}
      {deadlines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Clock className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No scheduled deadlines</h3>
          <p className="text-xs text-slate-500">
            Schedule corporate filings, permit renewals, or contract audit dates.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeadlines.map((dl) => {
            const isCompleted = dl.status === 'Completed';
            const isUrgent = dl.priority === 'Urgent' || dl.daysRemaining <= 7;

            return (
              <div
                key={dl.id}
                className={`bg-white rounded-xl border p-4.5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-200 opacity-60 bg-slate-50/50'
                    : isUrgent
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        dl.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : dl.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {dl.priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {dl.category}
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{dl.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {dl.deadlineDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assignee: {dl.responsiblePerson}</span>
                    </span>
                  </div>

                  {/* Reminder schedule badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Bell className="w-3 h-3" /> Alerts at:
                    </span>
                    {dl.reminderSchedule?.map((day) => (
                      <span
                        key={day}
                        className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-medium"
                      >
                        {day}d
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side status and actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold block ${
                        dl.daysRemaining <= 7 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {dl.daysRemaining === 0 ? 'Due Today' : `${dl.daysRemaining} days left`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{dl.status}</span>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handleComplete(dl)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      title="Mark as completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(dl.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD DEADLINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Schedule New Business Deadline</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeadline} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deadline Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. State Corporate Annual Report Filing"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as DeadlineItem['category'] })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Invoice">Invoice</option>
                    <option value="Insurance">Insurance</option>
                    <option value="License">License</option>
                    <option value="Contract">Contract</option>
                    <option value="Tax & Filing">Tax & Filing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={form.deadlineDate}
                    onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as DeadlineItem['priority'] })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={form.responsiblePerson}
                    onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Reminder Schedule Customizer */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-700 block">
                  Guardian Reminder Schedule (Days Before):
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[60, 30, 14, 7, 1].map((day) => {
                    const isChecked = form.reminderSchedule.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleScheduleDay(day)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {day} days before
                      </button>
                    );
                  })}
                </div>

                {/* Add custom offset day */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Custom days..."
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-32 p-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDay}
                    className="px-2.5 py-1.5 bg-slate-800 text-white font-semibold rounded-lg text-xs"
                  >
                    + Add Day
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Scheduling...' : 'Save Deadline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
