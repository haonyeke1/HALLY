import React, { useState } from 'react';
import {
  Building,
  User,
  Globe,
  DollarSign,
  Clock,
  Mail,
  Phone,
  MapPin,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { BusinessProfile, UserAccount } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  business: BusinessProfile;
  user: UserAccount;
  onUpdateBusiness: (b: BusinessProfile) => void;
  onUpdateUser: (u: UserAccount) => void;
  onResetDemoData: () => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  business,
  user,
  onUpdateBusiness,
  onUpdateUser,
  onResetDemoData,
  onClearData,
}) => {
  const [bizForm, setBizForm] = useState<BusinessProfile>({ ...business });
  const [userForm, setUserForm] = useState<UserAccount>({ ...user });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const resBiz = await api.updateBusinessProfile(bizForm);
      const resUser = await api.updateUserProfile(userForm);

      if (resBiz.success && resBiz.business) {
        onUpdateBusiness(resBiz.business);
      }
      if (resUser.success && resUser.user) {
        onUpdateUser(resUser.user);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Business & Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure company profile, time zone, default currency, and compliance identity.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile configuration successfully saved!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Business Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Business Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={bizForm.name}
                onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Type *</label>
              <input
                type="text"
                required
                value={bizForm.businessType}
                onChange={(e) => setBizForm({ ...bizForm, businessType: e.target.value })}
                placeholder="e.g. Management Consulting, Design Agency, Electrical Contractor"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Country *</label>
              <input
                type="text"
                required
                value={bizForm.country}
                onChange={(e) => setBizForm({ ...bizForm, country: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Currency *</label>
              <select
                value={bizForm.currency}
                onChange={(e) => setBizForm({ ...bizForm, currency: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
              >
                <option value="USD">USD ($) - United States Dollar (Default)</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
                <option value="SGD">SGD ($) - Singapore Dollar</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Time Zone *</label>
              <input
                type="text"
                required
                value={bizForm.timeZone}
                onChange={(e) => setBizForm({ ...bizForm, timeZone: e.target.value })}
                placeholder="America/New_York (EST)"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Phone</label>
              <input
                type="text"
                value={bizForm.phone || ''}
                onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Registered Address</label>
              <input
                type="text"
                value={bizForm.address || ''}
                onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* User / Owner Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Owner Account
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => {
                  setUserForm({ ...userForm, name: e.target.value });
                  setBizForm({ ...bizForm, ownerName: e.target.value });
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => {
                  setUserForm({ ...userForm, email: e.target.value });
                  setBizForm({ ...bizForm, email: e.target.value });
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Role / Title</label>
              <input
                type="text"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                placeholder="Managing Principal, Founder, Managing Director"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Plan</label>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                  {userForm.plan} Plan
                </span>
                <span className="text-[11px] text-slate-400">Full MVP access enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Demo Benchmark Environment & Empty State Switcher */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Demo Benchmark & Testing Controls
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Switch between the pre-loaded <strong>BrightPath Consulting</strong> benchmark (5 invoices, 5 documents, 3 urgent actions, $8,420 overdue) or test clean <strong>Empty States</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onResetDemoData}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Benchmark (BrightPath Consulting)</span>
          </button>

          <button
            type="button"
            onClick={onClearData}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-900/60 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear to Clean Empty State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
