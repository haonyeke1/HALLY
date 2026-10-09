import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Lock,
  DollarSign,
  FileText,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { RiskAssessmentItem, BusinessProfile } from '../types';

interface RiskAssessmentViewProps {
  risks: RiskAssessmentItem[];
  business: BusinessProfile;
  onMitigateRisk: (riskId: string) => void;
  onAddRisk: (risk: RiskAssessmentItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({
  risks,
  business,
  onMitigateRisk,
  onAddRisk,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState('');

  const openRisks = risks.filter((r) => r.status === 'Open');
  const mitigatedRisks = risks.filter((r) => r.status === 'Mitigated');

  // Calculate dynamic security posture score
  const totalRisksCount = risks.length;
  const criticalCount = openRisks.filter((r) => r.severity === 'Critical').length;
  const highCount = openRisks.filter((r) => r.severity === 'High').length;
  const mediumCount = openRisks.filter((r) => r.severity === 'Medium').length;

  // Base score 100 minus deductions for open risks
  const calculatedScore = Math.max(
    35,
    Math.min(98, 100 - criticalCount * 22 - highCount * 12 - mediumCount * 5)
  );

  const categories = [
    'ALL',
    'Financial',
    'Fraud & Scams',
    'Cybersecurity',
    'Legal & Compliance',
    'Operational',
  ];

  const filteredRisks = risks.filter((r) => {
    if (selectedCategory === 'ALL') return true;
    return r.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleRunAiAudit = () => {
    setIsScanning(true);
    setScanNotice('');
    setTimeout(() => {
      setIsScanning(false);
      setScanNotice(
        'AI Vulnerability Scan complete. Scanned active contracts, vendor records, and receivable aging.'
      );
      // Auto-add an intelligent simulated recommendation if not present
      if (!risks.some((r) => r.title.includes('Multi-Factor Authentication'))) {
        onAddRisk({
          id: `risk_${Date.now()}`,
          userId: 'usr_sarah_01',
          category: 'Cybersecurity',
          title: 'Unenforced Multi-Factor Authentication (MFA) on Banking & Cloud',
          severity: 'High',
          status: 'Open',
          impact: 'Exposes small business credentials to automated brute force and credential stuffing.',
          recommendation: 'Enable hardware or authenticator app 2FA on primary business email and accounts.',
          createdAt: 'Just now',
        });
      }
    }, 1800);
  };

  const getSeverityBadge = (severity: RiskAssessmentItem['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>BUSINESS VULNERABILITY AUDIT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Risk Assessment & Posture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Evaluate financial exposure, fraud susceptibility, cybersecurity posture, and compliance gaps.
          </p>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isScanning}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Vulnerabilities...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run AI Risk Audit</span>
            </>
          )}
        </button>
      </div>

      {scanNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanNotice}</span>
        </div>
      )}

      {/* Top Risk Posture Gauge Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Overall Protection Index ({business.name})
          </span>
          <div className="flex items-baseline gap-3">
            <span
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight font-mono ${
                calculatedScore >= 80
                  ? 'text-emerald-600'
                  : calculatedScore >= 60
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {calculatedScore}/100
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {calculatedScore >= 80
                ? 'Strong Resilience'
                : calculatedScore >= 60
                ? 'Moderate Vulnerability'
                : 'High Exposure Risk'}
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-md leading-relaxed">
            Guardian actively recalculates your protection score as overdue invoices are recovered,
            contracts are verified, and suspicious scams are neutralised.
          </p>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-3 text-center sm:border-l sm:pl-6 border-slate-200">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Critical</span>
            <span className="text-xl font-extrabold text-rose-700">{criticalCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">High/Med</span>
            <span className="text-xl font-extrabold text-amber-700">
              {highCount + mediumCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Mitigated</span>
            <span className="text-xl font-extrabold text-emerald-700">
              {mitigatedRisks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Risks List */}
      <div className="space-y-3.5">
        {filteredRisks.map((risk) => {
          const isOpen = risk.status === 'Open';
          return (
            <div
              key={risk.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-3 ${
                isOpen ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getSeverityBadge(
                      risk.severity
                    )}`}
                  >
                    {risk.severity} Severity
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {risk.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {risk.createdAt}
                  </span>
                </div>

                {isOpen ? (
                  <button
                    onClick={() => onMitigateRisk(risk.id)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Mitigated</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mitigated
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{risk.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  <strong className="text-slate-800">Potential Business Impact:</strong> {risk.impact}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Guardian Recommendation:</span>{' '}
                  <span>{risk.recommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
