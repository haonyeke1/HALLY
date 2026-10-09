import React from 'react';
import {
  Shield,
  Search,
  Bell,
  Plus,
  FileText,
  DollarSign,
  Clock,
  ListTodo,
  Calendar as CalendarIcon,
  Settings,
  ChevronDown,
  Sparkles,
  BarChart3,
  ExternalLink,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { BusinessProfile, UserAccount } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  business: BusinessProfile;
  user: UserAccount;
  urgentCount: number;
  overdueCount: number;
  unreadNotifsCount: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenUploadDoc: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewDeadline: () => void;
  onOpenAuth: () => void;
  onSwitchToLanding: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  business,
  user,
  urgentCount,
  overdueCount,
  unreadNotifsCount,
  onOpenSearch,
  onOpenNotifications,
  onOpenUploadDoc,
  onOpenNewInvoice,
  onOpenNewDeadline,
  onOpenAuth,
  onSwitchToLanding,
  isLoggedIn,
  onLogout,
}) => {
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const quickAddRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'risks', label: 'Risk Assessment', icon: ShieldCheck },
    { id: 'scam-detector', label: 'Scam & Fraud Detector', icon: ShieldAlert },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, isAi: true },
    {
      id: 'actions',
      label: 'Action Center',
      icon: ListTodo,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'invoices', label: 'Invoices', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 group focus:outline-none text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-base text-white">
                    BUSINESS GUARDIAN <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/80">AI</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wide font-medium hidden sm:block">
                  Protecting your business from preventable losses
                </p>
              </div>
            </button>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-800/80 hover:bg-slate-800 hover:text-slate-200 border border-slate-700 rounded-lg transition-all"
              title="Search documents, invoices, deadlines (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="text-[10px] bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-slate-900" />
              )}
            </button>

            {/* Quick Add Menu */}
            <div className="relative" ref={quickAddRef}>
              <button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Track New</span>
                <ChevronDown className="w-3 h-3 text-emerald-200" />
              </button>

              {quickAddOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-slate-200">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Add Monitored Item
                  </div>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false);
                      onOpenUploadDoc();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">Upload Document</div>
                      <div className="text-[10px] text-slate-400">Insurance, license, contract (AI extracted)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false);
                      onOpenNewInvoice();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">Add Invoice</div>
                      <div className="text-[10px] text-slate-400">Track due date & recover payment</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false);
                      onOpenNewDeadline();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">Schedule Deadline</div>
                      <div className="text-[10px] text-slate-400">Tax filing, permit renewal, obligation</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Business / User Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-slate-700 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {business.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-semibold text-white leading-tight max-w-[130px] truncate">
                    {business.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {user.name}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="text-xs font-bold text-white">{business.name}</div>
                    <div className="text-[11px] text-slate-400">{business.businessType}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {user.plan.toUpperCase()} PLAN
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {business.currency} · {business.country}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setCurrentTab('settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      Business & User Settings
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setCurrentTab('admin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Admin Dashboard (Product Owner)
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onSwitchToLanding();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      View Public Landing Page
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1">
                    {isLoggedIn ? (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-rose-400 hover:bg-slate-800"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-emerald-400 hover:bg-slate-800"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center overflow-x-auto py-2 px-4 gap-1.5 bg-slate-950/80 border-t border-slate-800 text-xs scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
