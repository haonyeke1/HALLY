export interface BusinessProfile {
  id: string;
  name: string;
  businessType: string;
  country: string;
  currency: string;
  timeZone: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  monitoredItemCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
  plan: 'free' | 'starter' | 'business' | 'pro';
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  businessId: string;
  name: string;
  type: 'Insurance' | 'License' | 'Permit' | 'Contract' | 'Certificate' | 'Employee document' | 'Supplier document' | 'Other';
  uploadDate: string;
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Renewal Pending';
  notes?: string;
  organization?: string;
  referenceNumber?: string;
  amount?: number;
  paymentDueDate?: string;
  obligations?: string[];
  fileSize?: string;
  fileType?: string;
  confirmedByOwner: boolean;
  rawTextPreview?: string;
}

export interface InvoiceItem {
  id: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceAmount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Due soon' | 'Due today' | 'Overdue' | 'Paid' | 'Disputed';
  notes?: string;
  paymentTerms?: string;
  remindersSentCount?: number;
  lastReminderSentAt?: string;
}

export interface DeadlineItem {
  id: string;
  businessId: string;
  title: string;
  category: 'Invoice' | 'Insurance' | 'License' | 'Contract' | 'Tax & Filing' | 'Other';
  deadlineDate: string;
  daysRemaining: number;
  responsiblePerson: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Dismissed';
  reminderSchedule: number[]; // e.g. [60, 30, 14, 7, 1]
  relatedId?: string;
}

export interface ActionItem {
  id: string;
  businessId: string;
  urgency: 'URGENT' | 'TODAY' | 'THIS WEEK' | 'UPCOMING' | 'COMPLETED';
  title: string;
  description: string;
  riskDescription: string;
  actionType: 'GENERATE_REMINDER' | 'VIEW_DOCUMENT' | 'RENEW_LICENSE' | 'REVIEW_CONTRACT' | 'CUSTOM';
  targetId?: string;
  targetType?: 'invoice' | 'document' | 'deadline';
  amount?: number;
  daysRemainingOrOverdue?: string;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'resolved';
}

export interface NotificationItem {
  id: string;
  businessId: string;
  type: 'invoice_overdue' | 'deadline_approaching' | 'document_expiry' | 'reminder_generated' | 'urgent_alert';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTab?: string;
}

export interface ActivityLog {
  id: string;
  businessId: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
}

export interface DashboardSummary {
  moneyOverdue: number;
  totalOutstanding: number;
  urgentActions: number;
  deadlinesThisMonth: number;
  documentsMonitored: number;
  totalMonitoredItems: number;
}

export interface ExtractedDocumentData {
  documentType: 'Insurance' | 'License' | 'Permit' | 'Contract' | 'Certificate' | 'Employee document' | 'Supplier document' | 'Other';
  organization: string;
  personName: string;
  issueDate: string;
  expiryDate: string;
  renewalDate: string;
  contractStartDate?: string;
  contractEndDate?: string;
  paymentAmount?: number | null;
  paymentDueDate?: string;
  importantObligations: string[];
  relevantReferenceNumbers: string;
  summary: string;
  confidence: 'high' | 'medium' | 'low';
  suggestedReminderDays: number[];
}

export interface RiskAssessmentItem {
  id: string;
  userId: string;
  category: 'Financial' | 'Cybersecurity' | 'Fraud & Scams' | 'Legal & Compliance' | 'Operational';
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Mitigated' | 'Ignored';
  impact: string;
  recommendation: string;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'fraud' | 'overdue' | 'expiry' | 'compliance' | 'security';
  priority: 'High' | 'Medium' | 'Low';
  actionLabel?: string;
  actionTab?: string;
  read: boolean;
  resolved: boolean;
  createdAt: string;
}

export interface ScamCheckItem {
  id: string;
  userId: string;
  source: string;
  suspicionText: string;
  verdict: 'Likely Scam' | 'Suspicious' | 'Likely Safe';
  riskScore: number;
  summary: string;
  redFlags: string[];
  actionGuide: string[];
  safeReplyTemplate?: string;
  createdAt: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

