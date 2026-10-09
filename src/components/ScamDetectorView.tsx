import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Building,
  Mail,
  DollarSign,
  PhoneCall,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { ScamCheckItem } from '../types';

interface ScamDetectorViewProps {
  onSaveScamCheck?: (check: ScamCheckItem) => void;
  onCreateAlert?: (title: string, message: string, priority: 'High' | 'Medium' | 'Low') => void;
}

export const ScamDetectorView: React.FC<ScamDetectorViewProps> = ({
  onSaveScamCheck,
  onCreateAlert,
}) => {
  const [inputText, setInputText] = useState('');
  const [sourceType, setSourceType] = useState('Vendor Email / Wire Request');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ScamCheckItem | null>(null);

  const sampleScenarios = [
    {
      title: 'Vendor Bank Account Switch',
      category: 'Wire Fraud',
      text: `URGENT NOTICE: Due to an internal financial audit, our bank accounts at Wells Fargo have been temporarily frozen. For our pending invoice #INV-8891 ($14,500), please immediately update your wire instructions to our new European clearing partner: IBAN DE89370400440532013000. This must be processed today to prevent late penalties. Do not reply to this email, funds must be sent immediately.`,
    },
    {
      title: 'CEO / Founder Wire Transfer Spoof',
      category: 'Executive Impersonation',
      text: `Hi Sarah, I am currently in confidential partner meetings and cannot take calls. I need you to wire $8,200 right away for an acquisition deposit. Routing number: 121000358, Account: 994820149. Keep this between us until tomorrow's board announcement. Please confirm when the wire confirmation code is ready. - Sent from my iPhone`,
    },
    {
      title: 'Fake Renewal / Trademark Threat',
      category: 'Domain & Trademark Phishing',
      text: `FINAL WARNING: Your international trademark and web directory registration for BrightPath Consulting expires in 24 hours. Failure to remit $580 immediately via credit card link below will result in cancellation and public listing forfeiture. Click here to maintain your business active standing: http://secure-business-portal-renew.xyz/pay`,
    },
    {
      title: 'Legitimate Vendor Progress Invoice',
      category: 'Normal Communication',
      text: `Hi Sarah, hope you're having a great week! Attached is our standard monthly retainer invoice #1042 for September services ($2,400 USD). As usual, it's payable within 30 days to our standard Chase business account listed on our Master Services Agreement. Let us know if you need any adjustments or have questions on the deliverables report. Thanks, Mark at Apex Global.`,
    },
  ];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeScam({
        suspicionText: inputText,
        source: sourceType,
      });

      if (res.analysis) {
        const item: ScamCheckItem = {
          id: `scam_${Date.now()}`,
          userId: 'usr_sarah_01',
          source: sourceType,
          suspicionText: inputText,
          verdict: res.analysis.verdict,
          riskScore: res.analysis.riskScore,
          summary: res.analysis.summary,
          redFlags: res.analysis.redFlags,
          actionGuide: res.analysis.actionGuide,
          safeReplyTemplate: res.analysis.safeReplyTemplate,
          createdAt: 'Just now',
        };
        setAnalysisResult(item);
        if (onSaveScamCheck) onSaveScamCheck(item);
        if (res.analysis.riskScore >= 70 && onCreateAlert) {
          onCreateAlert(
            `High Risk Communication Flagged: ${res.analysis.verdict}`,
            res.analysis.summary,
            'High'
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>FRAUD & SCAM PREVENTION ENGINE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Scam & Impersonation Detector
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Paste any suspicious email, invoice payment change, wire instructions, or urgent message.
          Gemini AI performs deep forensic checks to protect your business funds.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <label className="text-xs font-bold text-slate-700">
            Paste suspicious email text, wire transfer demand, or invoice notice:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Source:</span>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Vendor Email / Wire Request">Vendor Email / Wire Request</option>
              <option value="Supplier Invoice PDF Text">Supplier Invoice PDF Text</option>
              <option value="Executive Impersonation / CEO">Executive Impersonation / CEO</option>
              <option value="SMS / WhatsApp Message">SMS / WhatsApp Message</option>
              <option value="Tax or Legal Notice">Tax or Legal Notice</option>
            </select>
          </div>
        </div>

        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. 'URGENT: Please update bank account details for invoice #8849. Wire funds to the following new routing number...'"
          className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Sample scenario buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Try Sample:
            </span>
            {sampleScenarios.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(s.text);
                  setSourceType(s.category);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Forensic Scanning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                <span>Scan For Fraud & Deception</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Display */}
      {analysisResult && (
        <div
          className={`rounded-2xl border p-6 space-y-5 shadow-md animate-in fade-in slide-in-from-top-2 ${
            analysisResult.verdict === 'Likely Scam'
              ? 'bg-rose-50/50 border-rose-300'
              : analysisResult.verdict === 'Suspicious'
              ? 'bg-amber-50/50 border-amber-300'
              : 'bg-emerald-50/50 border-emerald-300'
          }`}
        >
          {/* Top Verdict Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  analysisResult.verdict === 'Likely Scam'
                    ? 'bg-rose-600 text-white'
                    : analysisResult.verdict === 'Suspicious'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {analysisResult.verdict === 'Likely Scam' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : analysisResult.verdict === 'Suspicious' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                      analysisResult.verdict === 'Likely Scam'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : analysisResult.verdict === 'Suspicious'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    Verdict: {analysisResult.verdict}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Source: {analysisResult.source}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {analysisResult.summary}
                </h3>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="text-right sm:border-l sm:pl-6 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Fraud Risk Index
              </span>
              <div
                className={`text-3xl font-extrabold font-mono ${
                  analysisResult.riskScore >= 75
                    ? 'text-rose-600'
                    : analysisResult.riskScore >= 40
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {analysisResult.riskScore}/100
              </div>
            </div>
          </div>

          {/* Red Flags & Action Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Red Flags Discovered */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Deceptive Red Flags Detected:</span>
              </h4>
              <ul className="space-y-1.5 text-slate-700">
                {analysisResult.redFlags?.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Defense Steps */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Immediate Defense Guidance:</span>
              </h4>
              <ul className="space-y-1.5 text-slate-700">
                {analysisResult.actionGuide?.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safe Reply Verification Template */}
          {analysisResult.safeReplyTemplate && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Safe Verification Channel Template:</span>
                </span>
                <button
                  onClick={() => handleCopyReply(analysisResult.safeReplyTemplate!)}
                  className="text-xs text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Reply</span>
                    </>
                  )}
                </button>
              </div>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-slate-700 leading-relaxed text-[11px]">
                {analysisResult.safeReplyTemplate}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
