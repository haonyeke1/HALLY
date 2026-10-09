import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
  Tag,
  ShieldCheck,
  Edit2,
  FileCheck,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, ExtractedDocumentData } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentSaved: (doc: DocumentItem) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentSaved,
}) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'confirm' | 'edit'>('upload');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    base64?: string;
  } | null>(null);
  const [manualText, setManualText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Editable confirmation form state
  const [editForm, setEditForm] = useState<{
    name: string;
    type: DocumentItem['type'];
    organization: string;
    personName: string;
    referenceNumber: string;
    issueDate: string;
    expiryDate: string;
    renewalDate: string;
    amount: string;
    paymentDueDate: string;
    obligations: string;
    notes: string;
  }>({
    name: '',
    type: 'Insurance',
    organization: '',
    personName: '',
    referenceNumber: '',
    issueDate: '',
    expiryDate: '',
    renewalDate: '',
    amount: '',
    paymentDueDate: '',
    obligations: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream',
        base64: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  // Pre-configured real sample templates for 1-click testing
  const loadSampleDocument = (sampleType: 'insurance' | 'contract' | 'license') => {
    if (sampleType === 'insurance') {
      const sampleText = `CERTIFICATE OF COMMERCIAL LIABILITY INSURANCE
POLICY NUMBER: POL-GL-2026-9902
CARRIER: Sentinel Mutual Underwriters Insurance Group
NAMED INSURED: BrightPath Consulting, LLC
POLICY EFFECTIVE DATE: October 15, 2025
POLICY EXPIRATION DATE: October 15, 2027
ANNUAL PREMIUM AMOUNT: $3,850.00 USD
PREMIUM DUE DATE: October 10, 2026
COVERAGE LIMITS:
- General Aggregate: $2,000,000
- Each Occurrence: $1,000,000
OBLIGATIONS AND CONDITIONS:
1. Insured must notify insurer in writing at least 30 days prior to material change or cancellation.
2. Maintain risk assessment logs for all active consulting client engagements.
3. Renewal premium must be received within 15 days of renewal date to avoid policy lapse.`;
      setManualText(sampleText);
      setSelectedFile({
        name: 'Sentinel_Commercial_Liability_Policy.pdf',
        size: '184 KB',
        type: 'application/pdf',
      });
    } else if (sampleType === 'contract') {
      const sampleText = `MASTER SERVICES AGREEMENT (MSA)
CONTRACT IDENTIFIER: MSA-GLOBAL-8831
PARTIES: Apex Global Holdings & BrightPath Consulting
EFFECTIVE START DATE: November 01, 2025
TERM EXPIRATION DATE: November 01, 2027
RENEWAL NOTICE DATE: October 01, 2027
TOTAL CONTRACT VALUE: $140,000.00 USD
PAYMENT TERMS: Invoices payable Net 30 from presentation
KEY OBLIGATIONS:
1. Vendor agrees to deliver quarterly executive KPI audits by the 15th of each quarter end.
2. 30 days written notice required prior to term expiration for non-renewal or rate adjustment.
3. Maintain strict non-disclosure of customer proprietary financial data for 3 years post-termination.`;
      setManualText(sampleText);
      setSelectedFile({
        name: 'Apex_Global_Master_Services_Agreement.docx',
        size: '95 KB',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } else {
      const sampleText = `STATE REGULATORY COMMISSION & CITY OPERATING LICENSE
LICENSE ID: WA-CORP-LIC-77401-B
ISSUING AUTHORITY: State Department of Licensing & City of Seattle
LICENSE HOLDER: BrightPath Consulting LLC
ISSUE DATE: January 10, 2026
EXPIRATION DATE: January 10, 2028
RENEWAL FILING DEADLINE: December 10, 2027
FILING FEE: $450.00 USD
OBLIGATIONS:
1. Annual corporate information report must be submitted with license renewal.
2. Display valid license number on all public business contracts and commercial invoices.`;
      setManualText(sampleText);
      setSelectedFile({
        name: 'State_Business_Operating_License_2026.pdf',
        size: '112 KB',
        type: 'application/pdf',
      });
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !manualText.trim()) {
      setErrorMessage('Please select a file or paste text to analyze.');
      return;
    }

    setErrorMessage('');
    setStep('analyzing');

    try {
      const payload: any = {
        filename: selectedFile?.name || 'document_upload.txt',
      };

      if (selectedFile?.base64 && selectedFile.type.startsWith('image/')) {
        payload.fileData = {
          base64: selectedFile.base64,
          mimeType: selectedFile.type,
          filename: selectedFile.name,
        };
      } else {
        payload.textContent = manualText.trim() || `Document filename: ${selectedFile?.name}. Analysis requested.`;
      }

      const result = await api.extractDocument(payload);

      if (result.extracted) {
        setExtractedData(result.extracted);
        // Pre-fill editable state
        const ext = result.extracted;
        setEditForm({
          name: selectedFile?.name?.replace(/\.[^/.]+$/, '') || `${ext.organization} ${ext.documentType}`,
          type: ext.documentType || 'Other',
          organization: ext.organization || '',
          personName: ext.personName || '',
          referenceNumber: ext.relevantReferenceNumbers || '',
          issueDate: ext.issueDate || '',
          expiryDate: ext.expiryDate || '',
          renewalDate: ext.renewalDate || '',
          amount: ext.paymentAmount ? String(ext.paymentAmount) : '',
          paymentDueDate: ext.paymentDueDate || '',
          obligations: Array.isArray(ext.importantObligations)
            ? ext.importantObligations.join('\n')
            : '',
          notes: ext.summary || '',
        });
        setStep('confirm');
      } else {
        setErrorMessage(
          result.message || "We couldn't confidently read this document. Please enter the details manually."
        );
        setStep('edit');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        "We couldn't confidently read this document. Please enter the important details manually."
      );
      setStep('edit');
    }
  };

  const handleConfirmAndSave = async () => {
    setIsSaving(true);
    try {
      const obligationsArray = editForm.obligations
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Determine initial status based on expiryDate
      let status: DocumentItem['status'] = 'Active';
      if (editForm.expiryDate) {
        const today = new Date('2026-10-08');
        const exp = new Date(editForm.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) status = 'Expired';
        else if (diffDays <= 30) status = 'Expiring Soon';
        else if (editForm.renewalDate) status = 'Renewal Pending';
      }

      const newDoc: Partial<DocumentItem> = {
        name: editForm.name || 'Untitled Document',
        type: editForm.type,
        organization: editForm.organization,
        referenceNumber: editForm.referenceNumber,
        issueDate: editForm.issueDate,
        expiryDate: editForm.expiryDate,
        renewalDate: editForm.renewalDate,
        amount: editForm.amount ? parseFloat(editForm.amount) : undefined,
        paymentDueDate: editForm.paymentDueDate,
        obligations: obligationsArray,
        notes: editForm.notes,
        status,
        fileSize: selectedFile?.size || 'Direct entry',
        fileType: selectedFile?.type || 'Text/Doc',
        confirmedByOwner: true,
      };

      const res = await api.createDocument(newDoc);
      if (res.success) {
        onDocumentSaved(res.document);
        onClose();
      }
    } catch (err) {
      console.error('Failed to save document:', err);
      setErrorMessage('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
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
                {step === 'upload' && 'Upload Document for Guardian AI Watch'}
                {step === 'analyzing' && 'Guardian AI is Scanning Document...'}
                {step === 'confirm' && 'AI Found: Confirm Document Information'}
                {step === 'edit' && 'Edit Document Information'}
              </h2>
              <p className="text-xs text-slate-400">
                AI extracts dates & obligations. Owner review required before saving.
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

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="docFileInput"
                onChange={handleFileInput}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{selectedFile.name}</div>
                  <div className="text-xs text-slate-500">
                    {selectedFile.size} · {selectedFile.type || 'Document'}
                  </div>
                  <label
                    htmlFor="docFileInput"
                    className="inline-block text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Change file
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <label
                      htmlFor="docFileInput"
                      className="cursor-pointer text-sm font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Click to choose a file
                    </label>{' '}
                    <span className="text-sm text-slate-500">or drag and drop here</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports PDF, JPG, PNG, DOC/DOCX, TXT (up to 25MB)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Sample Buttons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Or test immediately with a realistic sample document:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleDocument('insurance')}
                  className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs"
                >
                  <div className="font-bold text-slate-800">Commercial Insurance</div>
                  <div className="text-[11px] text-slate-500">Hartford/Sentinel policy</div>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleDocument('contract')}
                  className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs"
                >
                  <div className="font-bold text-slate-800">Enterprise MSA</div>
                  <div className="text-[11px] text-slate-500">Client retainer agreement</div>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleDocument('license')}
                  className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs"
                >
                  <div className="font-bold text-slate-800">Business License</div>
                  <div className="text-[11px] text-slate-500">City & state operating permit</div>
                </button>
              </div>
            </div>

            {/* Paste Text Fallback */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Or paste text / key clauses directly:
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste contract text, policy declarations page, or renewal notice..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono h-24"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={!selectedFile && !manualText.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract Information with AI</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ANALYZING SPINNER */}
        {step === 'analyzing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-pulse">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Guardian AI is Analyzing Document
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Identifying document category, expiration dates, renewal clauses, financial values, and critical obligations...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Running Gemini 3.8 Flash OCR & extraction engine</span>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM EXTRACTED DATA (Mandatory Requirement) */}
        {step === 'confirm' && extractedData && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Safety Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Guardian AI Extraction Review:</span>{' '}
                Extracted information is suggested for your verification. Please review dates and details carefully before confirming.
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    AI FOUND:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Confidence: {extractedData.confidence?.toUpperCase() || 'HIGH'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('edit')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Fields</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Document Name</span>
                  <span className="font-bold text-slate-900">{editForm.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Document Category</span>
                  <span className="font-bold text-slate-900">{editForm.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Provider / Organization</span>
                  <span className="font-bold text-slate-900">
                    {editForm.organization || 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Reference / Policy #</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {editForm.referenceNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Issue Date</span>
                  <span className="font-semibold text-slate-800">
                    {editForm.issueDate || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Expiry Date</span>
                  <span className="font-bold text-rose-700">
                    {editForm.expiryDate || 'N/A'}
                  </span>
                </div>
                {editForm.renewalDate && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Renewal Cutoff</span>
                    <span className="font-semibold text-amber-700">
                      {editForm.renewalDate}
                    </span>
                  </div>
                )}
                {editForm.amount && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Payment Amount</span>
                    <span className="font-bold text-slate-900">
                      ${parseFloat(editForm.amount).toLocaleString()} USD
                    </span>
                  </div>
                )}
              </div>

              {/* Obligations list */}
              {editForm.obligations && (
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Detected Key Obligations:
                  </span>
                  <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                    {editForm.obligations.split('\n').filter(Boolean).map((ob, idx) => (
                      <li key={idx}>{ob}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep('edit')}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                [Edit Details]
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : '[Confirm Information]'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EDIT FORM */}
        {step === 'edit' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Commercial General Liability Policy"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category *
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as DocumentItem['type'] })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Insurance">Insurance</option>
                  <option value="License">License</option>
                  <option value="Permit">Permit</option>
                  <option value="Contract">Contract</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Employee document">Employee document</option>
                  <option value="Supplier document">Supplier document</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Issuer / Provider / Company
                </label>
                <input
                  type="text"
                  value={editForm.organization}
                  onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                  placeholder="e.g. Hartford Mutual Underwriters"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reference / Policy #
                </label>
                <input
                  type="text"
                  value={editForm.referenceNumber}
                  onChange={(e) => setEditForm({ ...editForm, referenceNumber: e.target.value })}
                  placeholder="e.g. POL-99214-C"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={editForm.issueDate}
                  onChange={(e) => setEditForm({ ...editForm, issueDate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Renewal Notice Date
                </label>
                <input
                  type="date"
                  value={editForm.renewalDate}
                  onChange={(e) => setEditForm({ ...editForm, renewalDate: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Amount (if applicable)
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="e.g. 3200"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Important Obligations (One per line)
                </label>
                <textarea
                  value={editForm.obligations}
                  onChange={(e) => setEditForm({ ...editForm, obligations: e.target.value })}
                  placeholder="e.g. 30-day written cancellation notice required&#10;Submit annual revenues report"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Add any internal business context..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-16"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Preview
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSave}
                disabled={isSaving || !editForm.name.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Monitor Document'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
