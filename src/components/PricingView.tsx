import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Shield,
  HelpCircle,
  Building,
  Zap,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { UserAccount } from '../types';

interface PricingViewProps {
  user: UserAccount;
  onSelectPlan: (plan: 'free' | 'starter' | 'business' | 'pro') => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ user, onSelectPlan }) => {
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'FREE',
      price: '$0',
      period: '/month',
      description: 'Essential safeguard for individual freelancers and solopreneurs.',
      features: [
        'Up to 10 monitored documents',
        'Up to 15 invoices tracked',
        'Standard 7-day and 1-day reminders',
        'Manual document entry',
        'Single user account',
      ],
      popular: false,
      buttonText: user.plan === 'free' ? 'Current Plan' : 'Select Free',
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Ideal for independent consultants and small trade contractors.',
      features: [
        'Up to 50 monitored documents',
        'Up to 100 invoices tracked',
        'Gemini AI Document Extraction (OCR)',
        'Full 60/30/14/7/1 reminder schedules',
        'Automated AI Payment Reminder emails',
        'Email alerts for overdue accounts',
      ],
      popular: false,
      buttonText: user.plan === 'starter' ? 'Current Plan' : 'Select Starter',
    },
    {
      id: 'business',
      name: 'Business',
      price: '$29',
      period: '/month',
      description: 'Comprehensive loss prevention for growing agencies and firms.',
      features: [
        'Unlimited monitored documents',
        'Unlimited invoices tracked',
        'High-confidence AI contract & clause review',
        'Customizable reminder schedules & offsets',
        'Tone controls for AI Payment Reminders',
        'Direct iCalendar (.ics) integration',
        'Audit log & loss prevention analytics',
        'Priority email & webhook notifications',
      ],
      popular: true,
      buttonText: user.plan === 'business' ? 'Current Plan' : 'Select Business',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$79',
      period: '/month',
      description: 'Advanced risk mitigation for multi-entity firms and enterprise teams.',
      features: [
        'Everything in Business Plan',
        'Multiple business entities / brands',
        'Unlimited team members & assignees',
        'Custom legal compliance checklists',
        'Dedicated onboarding & policy migration',
        'Exportable executive audit reports',
        'SLA: 99.9% guaranteed uptime',
      ],
      popular: false,
      buttonText: user.plan === 'pro' ? 'Current Plan' : 'Select Pro',
    },
  ];

  const handlePlanClick = (planId: string) => {
    setSelectedPlanModal(planId);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>TRANSPARENT, RISK-FREE SAAS PRICING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Protect Your Business From Preventable Losses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          A single missed insurance renewal or uncollected $5,000 invoice costs far more than an entire year of Business Guardian.
        </p>
      </div>

      {/* Honest MVP Billing Status Notice (Per Spec) */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-4.5 border border-slate-800 flex items-start gap-3 shadow-md max-w-3xl mx-auto text-xs">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">MVP Billing Architecture:</span>{' '}
          In this MVP release, Stripe live payment processing is in sandbox setup. Selecting any plan activates your{' '}
          <strong className="text-emerald-400">complimentary full-access trial</strong> without taking real credit card details. No fake charges or hidden subscriptions.
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = user.plan === p.id;
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all relative ${
                p.popular
                  ? 'border-emerald-600 shadow-lg ring-2 ring-emerald-600/20'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {p.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    {p.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{p.period}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 min-h-[36px]">{p.description}</p>

                <div className="border-t border-slate-100 my-4" />

                <ul className="space-y-2 text-xs text-slate-700">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handlePlanClick(p.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default'
                      : p.popular
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{p.buttonText}</span>
                  {!isCurrent && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Selection Confirmation Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Activate {selectedPlanModal.toUpperCase()} Plan
              </h3>
              <p className="text-slate-500">
                Payment processing is marked as <strong>Coming Soon</strong>. We have activated your free MVP preview tier immediately.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Selected Tier:</span>
                <span className="font-mono">{selectedPlanModal.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Billed:</span>
                <span>$0.00 today (MVP Trial)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="w-1/2 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectPlan(selectedPlanModal as any);
                  setSelectedPlanModal(null);
                }}
                className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Confirm Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
