import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Shield,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Eye,
  Trash2,
  ExternalLink,
  Sparkles,
  Download,
  Info,
  X,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { api } from '../services/api';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onOpenUploadModal: () => void;
  onDocumentDeleted: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onOpenUploadModal,
  onDocumentDeleted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const categories = [
    'ALL',
    'Insurance',
    'License',
    'Permit',
    'Contract',
    'Certificate',
    'Employee document',
    'Supplier document',
    'Other',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.organization && doc.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.referenceNumber && doc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' || doc.type.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'ALL' || doc.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from Guardian monitoring?`)) {
      try {
        await api.deleteDocument(id);
        if (selectedDoc?.id === id) setSelectedDoc(null);
        onDocumentDeleted();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'Expiring Soon':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Expired':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Renewal Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Document Library & Compliance Watch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Guardian actively tracks contracts, licenses, insurance policies, and renewal clauses.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document (AI OCR)</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, provider, or policy #..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Renewal Pending">Renewal Pending</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">No documents monitored yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your insurance policies, business licenses, or client contracts. Business Guardian will automatically identify their expiration dates and alert you in advance.
            </p>
          </div>
          <button
            onClick={onOpenUploadModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Document</span>
          </button>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No documents match your filter.
        </div>
      ) : (
        /* Documents Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isExpiringSoon = doc.status === 'Expiring Soon';
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-4.5 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                      {doc.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        doc.status
                      )}`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  {/* Document Name */}
                  <div>
                    <h3
                      onClick={() => setSelectedDoc(doc)}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug line-clamp-2"
                    >
                      {doc.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.organization || 'Internal / Unspecified'}</span>
                    </div>
                  </div>

                  {/* Reference & Expiry Info */}
                  <div className="bg-slate-50/80 rounded-lg p-2.5 space-y-1 text-xs border border-slate-100">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Ref / Policy:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {doc.referenceNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Expires:</span>
                      <span className={`font-bold ${isExpiringSoon ? 'text-amber-700' : 'text-slate-800'}`}>
                        {doc.expiryDate || 'Continuous'}
                      </span>
                    </div>
                    {doc.renewalDate && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Renewal Notice:</span>
                        <span>{doc.renewalDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Obligations preview */}
                  {doc.obligations && doc.obligations.length > 0 && (
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-700 block">Key Obligation:</span>
                      <p className="line-clamp-2 italic text-slate-500">
                        &ldquo;{doc.obligations[0]}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Uploaded {doc.uploadDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete from Monitoring"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DOCUMENT DETAIL DRAWER / MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wide">
                  {selectedDoc.type}
                </span>
                <h3 className="text-base font-bold mt-1 text-white">{selectedDoc.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Provider / Organization</span>
                  <span className="font-bold text-slate-900">
                    {selectedDoc.organization || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Reference / Policy #</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedDoc.referenceNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Issue Date</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDoc.issueDate || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Expiration Date</span>
                  <span className="font-bold text-rose-700">
                    {selectedDoc.expiryDate || 'N/A'}
                  </span>
                </div>
                {selectedDoc.renewalDate && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Renewal Cutoff Window</span>
                    <span className="font-bold text-amber-700">
                      {selectedDoc.renewalDate}
                    </span>
                  </div>
                )}
                {selectedDoc.amount && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Amount</span>
                    <span className="font-bold text-slate-900">
                      ${selectedDoc.amount.toLocaleString()} USD
                    </span>
                  </div>
                )}
              </div>

              {/* Obligations */}
              {selectedDoc.obligations && selectedDoc.obligations.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Monitored Obligations & Clauses</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedDoc.obligations.map((ob, idx) => (
                      <li key={idx}>{ob}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {selectedDoc.notes && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">Internal Notes</h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {selectedDoc.notes}
                  </p>
                </div>
              )}

              {/* Verified Authoritative Stamp */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Authoritative Status:</strong> Verified & confirmed by business owner on{' '}
                  {selectedDoc.uploadDate}.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedDoc.id, selectedDoc.name)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from Guardian</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
