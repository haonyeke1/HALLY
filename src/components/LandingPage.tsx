import React from 'react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  FileText,
  DollarSign,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Building2,
  Briefcase,
  Layers,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-base">
              BUSINESS GUARDIAN <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/80">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#audience" className="hover:text-white transition-colors">Who It’s For</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onEnterDashboard}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>PROTECT YOUR BUSINESS FROM PREVENTABLE LOSSES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Never miss a payment, renewal or important business deadline again.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Business Guardian watches the important details of your business and tells you what needs attention before forgotten tasks become expensive problems.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onEnterDashboard}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <span>See How It Works</span>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Human confirmation on all actions
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> International ready
            </span>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-white uppercase tracking-wider">
                  Live Guardian Directive Preview
                </span>
              </div>
              <span className="text-slate-400 font-mono">Status: Active Watch</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Money Overdue</span>
                <div className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1">$8,420</div>
                <span className="text-[10px] text-rose-300">2 invoices require recovery</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Urgent Actions</span>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">3</div>
                <span className="text-[10px] text-amber-300">Insurance & receivables</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Deadlines This Month</span>
                <div className="text-xl sm:text-2xl font-extrabold text-blue-400 mt-1">5</div>
                <span className="text-[10px] text-blue-300">Scheduled October watch</span>
              </div>
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Items Monitored</span>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">27</div>
                <span className="text-[10px] text-emerald-300">Continuous compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM SECTION */}
      <section id="problem" className="py-20 bg-slate-950/60 border-t border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Running a small business means remembering hundreds of things.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every year, viable businesses suffer catastrophic cashflow crunches, voided insurance claims, or regulatory penalties—not from bad strategy, but from simple forgotten deadlines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { label: 'Unpaid Invoices', risk: 'Uncollected revenue lost' },
              { label: 'Contracts', risk: 'Auto-renewal rate hikes' },
              { label: 'Insurance', risk: 'Uninsured liability lapse' },
              { label: 'Licenses', risk: 'Municipal fines & halts' },
              { label: 'Renewals', risk: 'Vendor lock-in fees' },
              { label: 'Deadlines', risk: 'Tax penalty interest' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto mb-1" />
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.risk}</div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-800/40 text-center space-y-2">
            <h3 className="text-lg font-extrabold text-white">
              Business Guardian keeps watch.
            </h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Our single operating philosophy:{' '}
              <span className="font-mono font-bold text-emerald-400">
                MONITOR → DETECT → REMIND → RECOMMEND ACTION
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION (Specified 3 Steps) */}
      <section id="how-it-works" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Three Simple Steps
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How Business Guardian Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="text-xs font-extrabold text-emerald-400 tracking-wider">STEP 1</div>
            <h3 className="text-base font-bold text-white">Upload</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload invoices, contracts, policies, and important business documents in PDF, DOCX, or images.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="text-xs font-extrabold text-emerald-400 tracking-wider">STEP 2</div>
            <h3 className="text-base font-bold text-white">Guardian watches</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI identifies important dates, amounts, obligations, and renewal cutoff clauses with owner verification.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative">
            <div className="text-xs font-extrabold text-emerald-400 tracking-wider">STEP 3</div>
            <h3 className="text-base font-bold text-white">Take action</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get timely reminders and AI-generated payment reminders before forgotten tasks become expensive.
            </p>
          </div>
        </div>
      </section>

      {/* 5. KEY FEATURES */}
      <section id="features" className="py-20 bg-slate-950/70 border-t border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Focused Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineered Specifically For Solopreneurs & Small Firms
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2 w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Document Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Gemini 3.8 Flash. Reads policy declarations, contracts, and permits. Never saves without owner confirmation.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2 w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Invoice Cashflow Monitor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks accounts receivable, flags overdue invoices, and calculates outstanding aging balances in USD and global currencies.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2 w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Payment Reminder Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates courteous, polite recovery emails tailored to invoice aging. You review, edit, copy, or schedule.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2 w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Central Deadline Schedule</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Default alerts at 60, 30, 14, 7, and 1 days before expiry. Fully customizable reminder offsets.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2 w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Action Center</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizes obligations into Urgent, Today, This Week, and Upcoming buckets. Clear business risk explanations.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="p-2 w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Strict Privacy & Safety</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-tenant isolated data. No legal or tax advice overreach. Documents are never public.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHO IT’S FOR */}
      <section id="audience" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Target Customers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Built For People With High-Stakes Deadlines
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { title: 'Freelancers & Consultants', desc: 'Never let client invoices sit unpaid or contract terms lapse.' },
            { title: 'Agencies & Studios', desc: 'Safeguard retainer renewal windows and contractor agreements.' },
            { title: 'Trade Contractors', desc: 'Track general liability insurance, bond renewals & operating permits.' },
            { title: 'Professional Services', desc: 'Ensure employee certifications and compliance audits stay current.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <Briefcase className="w-5 h-5 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-bold text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PRICING TEASER */}
      <section id="pricing" className="py-20 bg-slate-950/70 border-t border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Simple, Transparent Plans
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Start with our Free plan or upgrade as your business expands.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400">FREE</div>
              <div className="text-2xl font-extrabold text-white mt-1">$0</div>
              <div className="text-[10px] text-slate-500">10 docs · 15 invoices</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400">Starter</div>
              <div className="text-2xl font-extrabold text-white mt-1">$9</div>
              <div className="text-[10px] text-slate-500">50 docs · AI OCR</div>
            </div>
            <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/80">
              <div className="text-xs font-bold text-emerald-400">Business</div>
              <div className="text-2xl font-extrabold text-white mt-1">$29</div>
              <div className="text-[10px] text-emerald-300">Unlimited · Most popular</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-400">Pro</div>
              <div className="text-2xl font-extrabold text-white mt-1">$79</div>
              <div className="text-[10px] text-slate-500">Multi-business · Teams</div>
            </div>
          </div>

          <button
            onClick={onEnterDashboard}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Dashboard & Pricing Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white text-sm">
              Does Business Guardian provide legal or financial advice?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              No. Business Guardian is a monitoring and administrative notification tool. It extracts dates, amounts, and clauses for your explicit confirmation. It never provides authoritative legal, tax, or financial advice.
            </p>
          </div>

          <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white text-sm">
              Will Business Guardian send emails to my clients without my knowledge?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Never. Our foundational rule is human authorization: Guardian drafts payment reminders and alerts you, but you decide whether and when to send or schedule them.
            </p>
          </div>

          <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white text-sm">
              What formats can I upload for AI extraction?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              You can upload PDF files, JPG and PNG images of contracts or certificates, DOC/DOCX files, or paste raw text. Gemini 3.8 Flash parses the content and presents every extracted field for your confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Protect your business from preventable losses today.
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join small business owners who sleep better knowing Business Guardian is watching the critical dates.
          </p>
          <div className="pt-2">
            <button
              onClick={onEnterDashboard}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-emerald-950 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Business Guardian MVP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Business Guardian AI. All rights reserved. Built for small business protection.</p>
        </div>
      </footer>
    </div>
  );
};
