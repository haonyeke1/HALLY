import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  DollarSign,
  Clock,
  ListTodo,
  ArrowRight,
} from 'lucide-react';
import { DocumentItem, InvoiceItem, DeadlineItem, ActionItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  invoices: InvoiceItem[];
  deadlines: DeadlineItem[];
  actions: ActionItem[];
  onSelectItem: (type: 'document' | 'invoice' | 'deadline' | 'action', item: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  invoices,
  deadlines,
  actions,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedDocs = q
    ? documents.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.organization && d.organization.toLowerCase().includes(q)) ||
          (d.referenceNumber && d.referenceNumber.toLowerCase().includes(q))
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerEmail.toLowerCase().includes(q)
      )
    : [];

  const matchedDeadlines = q
    ? deadlines.filter(
        (dl) =>
          dl.title.toLowerCase().includes(q) ||
          dl.category.toLowerCase().includes(q) ||
          dl.responsiblePerson.toLowerCase().includes(q)
      )
    : [];

  const matchedActions = q
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.riskDescription.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedDocs.length + matchedInvoices.length + matchedDeadlines.length + matchedActions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-xs p-4 pt-16 sm:pt-24 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, invoices, clients, deadlines, or actions..."
            className="w-full text-sm font-medium bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="text-center py-8 text-slate-400">
              Type keywords such as <em>insurance</em>, <em>Apex Global</em>, <em>#1042</em>, or <em>license</em>.
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No results found matching &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Invoices ({matchedInvoices.length})
                  </div>
                  {matchedInvoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        onSelectItem('invoice', inv);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">
                            {inv.customerName} · {inv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Due {inv.dueDate} · ${inv.invoiceAmount.toLocaleString()} {inv.currency}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {inv.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Documents */}
              {matchedDocs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Documents ({matchedDocs.length})
                  </div>
                  {matchedDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        onSelectItem('document', doc);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{doc.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {doc.organization || doc.type} · Expires: {doc.expiryDate || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {doc.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Deadlines */}
              {matchedDeadlines.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Deadlines ({matchedDeadlines.length})
                  </div>
                  {matchedDeadlines.map((dl) => (
                    <button
                      key={dl.id}
                      onClick={() => {
                        onSelectItem('deadline', dl);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{dl.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Due {dl.deadlineDate} · Assignee: {dl.responsiblePerson}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {dl.priority}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              {matchedActions.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Actions ({matchedActions.length})
                  </div>
                  {matchedActions.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => {
                        onSelectItem('action', act);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ListTodo className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{act.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {act.description}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {act.urgency}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-400 text-[11px] flex justify-between">
          <span>Press ESC to close</span>
          <span>Guardian Universal Index</span>
        </div>
      </div>
    </div>
  );
};
