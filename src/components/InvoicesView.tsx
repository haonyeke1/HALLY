import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  Trash2,
  Edit,
  ArrowUpDown,
  FileText,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { InvoiceItem, BusinessProfile } from '../types';
import { api } from '../services/api';

interface InvoicesViewProps {
  invoices: InvoiceItem[];
  business: BusinessProfile;
  onGenerateReminder: (inv: InvoiceItem) => void;
  onInvoiceCreated: (inv: InvoiceItem) => void;
  onInvoiceUpdated: () => void;
  onInvoiceDeleted: () => void;
  onOpenUploadDoc: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  business,
  onGenerateReminder,
  onInvoiceCreated,
  onInvoiceUpdated,
  onInvoiceDeleted,
  onOpenUploadDoc,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<InvoiceItem | null>(null);

  // New Invoice form state
  const [newInv, setNewInv] = useState({
    customerName: '',
    customerEmail: '',
    invoiceNumber: '#',
    invoiceAmount: '',
    currency: business.currency || 'USD',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Sent' as InvoiceItem['status'],
    notes: '',
    paymentTerms: 'Net 30',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto Calculations (Specified in brief)
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'Paid' && inv.status !== 'Draft')
    .reduce((sum, inv) => sum + (Number(inv.invoiceAmount) || 0), 0);

  const totalOverdue = invoices
    .filter((inv) => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + (Number(inv.invoiceAmount) || 0), 0);

  const invoicesDueThisWeek = invoices.filter((inv) => {
    if (inv.status === 'Paid') return false;
    // Oct 8 to Oct 15, 2026
    return inv.dueDate >= '2026-10-08' && inv.dueDate <= '2026-10-15';
  }).length;

  const invoicesDueThisMonth = invoices.filter((inv) => {
    if (inv.status === 'Paid') return false;
    return inv.dueDate.startsWith('2026-10');
  }).length;

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = async (inv: InvoiceItem) => {
    try {
      await api.markInvoicePaid(inv.id, inv.invoiceNumber);
      onInvoiceUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.deleteInvoice(id);
        onInvoiceDeleted();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.customerName.trim() || !newInv.invoiceNumber.trim() || !newInv.invoiceAmount) {
      setFormError('Please fill in required fields: Customer Name, Invoice #, Amount.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await api.createInvoice({
        customerName: newInv.customerName,
        customerEmail: newInv.customerEmail,
        invoiceNumber: newInv.invoiceNumber,
        invoiceAmount: parseFloat(newInv.invoiceAmount),
        currency: newInv.currency,
        invoiceDate: newInv.invoiceDate,
        dueDate: newInv.dueDate || new Date().toISOString().split('T')[0],
        status: newInv.status,
        notes: newInv.notes,
        paymentTerms: newInv.paymentTerms,
      });

      if (res.success) {
        onInvoiceCreated(res.invoice);
        setIsAddModalOpen(false);
        setNewInv({
          customerName: '',
          customerEmail: '',
          invoiceNumber: '#',
          invoiceAmount: '',
          currency: business.currency || 'USD',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          status: 'Sent',
          notes: '',
          paymentTerms: 'Net 30',
        });
      }
    } catch (err) {
      console.error(err);
      setFormError('Failed to save invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: InvoiceItem['status']) => {
    switch (status) {
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Due today':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Due soon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Sent':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Disputed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoice Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track receivables, prevent unpaid client defaults, and generate AI payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Invoice</span>
          </button>
        </div>
      </div>

      {/* 4 Auto-Calculation Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Outstanding
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">
              ${totalOutstanding.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">{business.currency}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">All unsettled invoices</p>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Total Overdue
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-rose-600">
              ${totalOverdue.toLocaleString()}
            </span>
            <span className="text-xs text-rose-400 font-mono">{business.currency}</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {invoices.filter((i) => i.status === 'Overdue').length} overdue client accounts
          </p>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Due This Week
          </span>
          <div className="mt-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{invoicesDueThisWeek}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Expected settlement within 7 days</p>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Due This Month
          </span>
          <div className="mt-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{invoicesDueThisMonth}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">October 2026 cashflow target</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer or invoice #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {['ALL', 'OVERDUE', 'DUE TODAY', 'DUE SOON', 'SENT', 'PAID', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State Check */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">No invoices yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your first invoice and Business Guardian will help you track its due date and ensure you get paid on time.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Invoice</span>
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No invoices match your current filter.
        </div>
      ) : (
        /* Invoices Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.map((inv) => {
                  const isOverdue = inv.status === 'Overdue';
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">
                          ${inv.invoiceAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.currency}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.invoiceDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                          {inv.dueDate}
                        </span>
                        {inv.paymentTerms && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {inv.paymentTerms}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Generate Reminder Action */}
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => onGenerateReminder(inv)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                              title="Generate AI Payment Reminder"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-200" />
                              <span className="hidden sm:inline">AI Reminder</span>
                            </button>
                          )}

                          {/* Mark Paid Button */}
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => handleMarkPaid(inv)}
                              className="text-[11px] text-emerald-700 hover:bg-emerald-50 border border-emerald-300 font-semibold px-2 py-1 rounded-lg transition-colors"
                              title="Mark as Paid"
                            >
                              Paid
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD INVOICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Monitored Invoice</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInv.customerName}
                    onChange={(e) => setNewInv({ ...newInv, customerName: e.target.value })}
                    placeholder="e.g. Apex Global"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Customer Billing Email
                  </label>
                  <input
                    type="email"
                    value={newInv.customerEmail}
                    onChange={(e) => setNewInv({ ...newInv, customerEmail: e.target.value })}
                    placeholder="billing@customer.com"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInv.invoiceNumber}
                    onChange={(e) => setNewInv({ ...newInv, invoiceNumber: e.target.value })}
                    placeholder="#1058"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Amount * ({newInv.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newInv.invoiceAmount}
                    onChange={(e) => setNewInv({ ...newInv, invoiceAmount: e.target.value })}
                    placeholder="2500"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={newInv.invoiceDate}
                    onChange={(e) => setNewInv({ ...newInv, invoiceDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newInv.dueDate}
                    onChange={(e) => setNewInv({ ...newInv, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select
                    value={newInv.status}
                    onChange={(e) =>
                      setNewInv({ ...newInv, status: e.target.value as InvoiceItem['status'] })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Sent">Sent</option>
                    <option value="Due soon">Due soon</option>
                    <option value="Due today">Due today</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Draft">Draft</option>
                    <option value="Paid">Paid</option>
                    <option value="Disputed">Disputed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={newInv.paymentTerms}
                    onChange={(e) => setNewInv({ ...newInv, paymentTerms: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={newInv.notes}
                    onChange={(e) => setNewInv({ ...newInv, notes: e.target.value })}
                    placeholder="Project name or billing contact..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
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
                  <span>{isSubmitting ? 'Saving...' : 'Add Invoice to Guardian'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
