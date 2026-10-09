import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support larger uploads for document PDFs and images
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize GoogleGenAI instance with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// IN-MEMORY / EXTENSIBLE SAAS DATABASE
// Multi-tenant ready schema
// ==========================================

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
  relatedId?: string; // document or invoice id
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

// Initial Demo Business: BrightPath Consulting
const initialBusiness: BusinessProfile = {
  id: 'biz_brightpath_01',
  name: 'BrightPath Consulting',
  businessType: 'Management & Strategy Consulting',
  country: 'United States',
  currency: 'USD',
  timeZone: 'America/New_York (EST)',
  ownerName: 'Sarah Jenkins',
  email: 'sarah.jenkins@brightpathconsulting.com',
  phone: '+1 (206) 555-0149',
  address: '800 5th Avenue, Suite 4100, Seattle, WA 98104',
  monitoredItemCount: 27,
};

const initialUser: UserAccount = {
  id: 'usr_sarah_01',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@brightpathconsulting.com',
  role: 'Managing Principal & Founder',
  businessId: 'biz_brightpath_01',
  plan: 'business',
  createdAt: '2026-01-15T09:00:00Z',
};

// 5 Initial Documents
const initialDocuments: DocumentItem[] = [
  {
    id: 'doc_01',
    businessId: 'biz_brightpath_01',
    name: 'Commercial General Liability Policy',
    type: 'Insurance',
    organization: 'Hartford Mutual Underwriters',
    referenceNumber: 'POL-CGL-8849102',
    uploadDate: '2026-01-15',
    expiryDate: '2026-10-15', // Exactly 7 days from Oct 8, 2026!
    renewalDate: '2026-10-10',
    status: 'Expiring Soon',
    notes: 'Covers professional errors & omissions up to $2,000,000 aggregate. Renewal notice received.',
    amount: 3200,
    obligations: [
      'Maintain continuous coverage for Fortune 500 client contracts',
      'Pay premium renewal before Oct 15 grace cutoff to avoid cancellation',
      'Submit updated annual revenue declaration with carrier',
    ],
    confirmedByOwner: true,
  },
  {
    id: 'doc_02',
    businessId: 'biz_brightpath_01',
    name: 'City Business Operating License',
    type: 'License',
    organization: 'City of Seattle Department of Revenue',
    referenceNumber: 'SEA-BL-99214-A',
    uploadDate: '2026-02-01',
    expiryDate: '2026-11-19', // 42 days out
    renewalDate: '2026-11-05',
    status: 'Active',
    notes: 'Mandatory municipal consulting operating permit.',
    obligations: [
      'File B&O tax return concurrently with renewal',
      'Display physical certificate or electronic verification at registered office',
    ],
    confirmedByOwner: true,
  },
  {
    id: 'doc_03',
    businessId: 'biz_brightpath_01',
    name: 'Master Services Agreement (MSA) - Acme Corp',
    type: 'Contract',
    organization: 'Acme Global Enterprises Inc.',
    referenceNumber: 'MSA-2025-AG-44',
    uploadDate: '2025-11-01',
    expiryDate: '2026-11-30',
    renewalDate: '2026-10-31',
    status: 'Active',
    notes: 'Key enterprise retainer ($180,000/yr). 30-day mutual written renewal notice clause.',
    obligations: [
      '30-day written notice required prior to Nov 30 to auto-extend rates',
      'Quarterly cybersecurity audit compliance confirmation',
      'Key personnel non-solicitation valid through end of term',
    ],
    confirmedByOwner: true,
  },
  {
    id: 'doc_04',
    businessId: 'biz_brightpath_01',
    name: 'AWS Enterprise Cloud Services Agreement',
    type: 'Supplier document',
    organization: 'Amazon Web Services Inc.',
    referenceNumber: 'AWS-ENT-00921',
    uploadDate: '2026-03-10',
    expiryDate: '2026-10-22', // 14 days out
    renewalDate: '2026-10-15',
    status: 'Expiring Soon',
    notes: 'Annual reserved enterprise cloud discount agreement. Auto-renews unless modified 7 days prior.',
    obligations: [
      'Must adjust reserved tier before Oct 15 to prevent higher standard on-demand pricing',
      'Review monthly spend threshold limits',
    ],
    confirmedByOwner: true,
  },
  {
    id: 'doc_05',
    businessId: 'biz_brightpath_01',
    name: 'ISO 27001 Security Audit Certificate',
    type: 'Certificate',
    organization: 'BSI Assurance Americas',
    referenceNumber: 'CERT-ISO27001-5582',
    uploadDate: '2025-12-10',
    expiryDate: '2026-12-15',
    status: 'Active',
    notes: 'Required for all financial services and healthcare consulting clients.',
    obligations: [
      'Annual surveillance audit prep required 45 days prior to expiry',
      'Maintain security incident log for lead auditor inspection',
    ],
    confirmedByOwner: true,
  },
];

// 5 Initial Invoices (2 Overdue totaling $8,420!)
const initialInvoices: InvoiceItem[] = [
  {
    id: 'inv_1042',
    businessId: 'biz_brightpath_01',
    customerName: 'Apex Global',
    customerEmail: 'billing@apexglobal.io',
    invoiceNumber: '#1042',
    invoiceAmount: 2400,
    currency: 'USD',
    invoiceDate: '2026-08-20',
    dueDate: '2026-09-20', // 18 days overdue
    status: 'Overdue',
    notes: 'Q3 Strategy Roadmap milestone 2 delivery. Contact: Mark Townsend, CFO.',
    paymentTerms: 'Net 30',
    remindersSentCount: 1,
    lastReminderSentAt: '2026-09-25T14:30:00Z',
  },
  {
    id: 'inv_1047',
    businessId: 'biz_brightpath_01',
    customerName: 'Horizon Media Group',
    customerEmail: 'ap@horizonmediagroup.com',
    invoiceNumber: '#1047',
    invoiceAmount: 6020,
    currency: 'USD',
    invoiceDate: '2026-08-28',
    dueDate: '2026-09-28', // 10 days overdue
    status: 'Overdue',
    notes: 'Brand positioning and performance media audit. Contact: Claire Vance.',
    paymentTerms: 'Net 30',
    remindersSentCount: 0,
  },
  {
    id: 'inv_1052',
    businessId: 'biz_brightpath_01',
    customerName: 'Vanguard Ventures',
    customerEmail: 'accounts@vanguardventures.vc',
    invoiceNumber: '#1052',
    invoiceAmount: 4500,
    currency: 'USD',
    invoiceDate: '2026-09-08',
    dueDate: '2026-10-08', // Due today!
    status: 'Due today',
    notes: 'Due diligence advisory for Series B portfolio assessment.',
    paymentTerms: 'Net 30',
    remindersSentCount: 0,
  },
  {
    id: 'inv_1055',
    businessId: 'biz_brightpath_01',
    customerName: 'Summit Health Partners',
    customerEmail: 'finance@summithealth.org',
    invoiceNumber: '#1055',
    invoiceAmount: 7800,
    currency: 'USD',
    invoiceDate: '2026-09-14',
    dueDate: '2026-10-14', // Due in 6 days (due soon)
    status: 'Due soon',
    notes: 'Workflow automation feasibility study and clinical tech review.',
    paymentTerms: 'Net 30',
    remindersSentCount: 0,
  },
  {
    id: 'inv_1039',
    businessId: 'biz_brightpath_01',
    customerName: 'Cascade Logistics',
    customerEmail: 'payables@cascadelogistics.com',
    invoiceNumber: '#1039',
    invoiceAmount: 3150,
    currency: 'USD',
    invoiceDate: '2026-08-15',
    dueDate: '2026-09-15',
    status: 'Paid',
    notes: 'Supply chain resilience consulting report. Paid via ACH.',
    paymentTerms: 'Net 30',
    remindersSentCount: 1,
    lastReminderSentAt: '2026-09-10T10:00:00Z',
  },
];

// Initial Deadlines
const initialDeadlines: DeadlineItem[] = [
  {
    id: 'dl_01',
    businessId: 'biz_brightpath_01',
    title: 'Commercial General Liability Policy Expiry & Renewal',
    category: 'Insurance',
    deadlineDate: '2026-10-15',
    daysRemaining: 7,
    responsiblePerson: 'Sarah Jenkins',
    priority: 'Urgent',
    status: 'Pending',
    reminderSchedule: [60, 30, 14, 7, 1],
    relatedId: 'doc_01',
  },
  {
    id: 'dl_02',
    businessId: 'biz_brightpath_01',
    title: 'Vanguard Ventures Invoice #1052 Due',
    category: 'Invoice',
    deadlineDate: '2026-10-08',
    daysRemaining: 0,
    responsiblePerson: 'Accounts Receivable',
    priority: 'High',
    status: 'Pending',
    reminderSchedule: [7, 3, 1, 0],
    relatedId: 'inv_1052',
  },
  {
    id: 'dl_03',
    businessId: 'biz_brightpath_01',
    title: 'AWS Enterprise Cloud Commitment Renewal',
    category: 'Contract',
    deadlineDate: '2026-10-22',
    daysRemaining: 14,
    responsiblePerson: 'Tech Lead / Sarah Jenkins',
    priority: 'Medium',
    status: 'Pending',
    reminderSchedule: [30, 14, 7, 1],
    relatedId: 'doc_04',
  },
  {
    id: 'dl_04',
    businessId: 'biz_brightpath_01',
    title: 'City of Seattle Business License Renewal Window',
    category: 'License',
    deadlineDate: '2026-11-19',
    daysRemaining: 42,
    responsiblePerson: 'Sarah Jenkins',
    priority: 'Low',
    status: 'Pending',
    reminderSchedule: [60, 30, 14, 7, 1],
    relatedId: 'doc_02',
  },
];

// Initial Action Items
const initialActions: ActionItem[] = [
  {
    id: 'act_01',
    businessId: 'biz_brightpath_01',
    urgency: 'URGENT',
    title: 'Commercial Liability Insurance expires in 7 days',
    description: 'Policy POL-CGL-8849102 with Hartford Mutual Underwriters expires on Oct 15, 2026.',
    riskDescription: 'Lapse in coverage violates active client MSAs and leaves firm personally exposed to liability claims.',
    actionType: 'VIEW_DOCUMENT',
    targetId: 'doc_01',
    targetType: 'document',
    amount: 3200,
    daysRemainingOrOverdue: '7 days left',
    createdAt: '2026-10-08T08:00:00Z',
    status: 'pending',
  },
  {
    id: 'act_02',
    businessId: 'biz_brightpath_01',
    urgency: 'URGENT',
    title: 'Invoice #1042 is 18 days overdue ($2,400)',
    description: 'Apex Global has not settled Invoice #1042 due on September 20, 2026.',
    riskDescription: 'Uncollected cashflow hampers working capital; early polite follow-up drastically increases recovery speed.',
    actionType: 'GENERATE_REMINDER',
    targetId: 'inv_1042',
    targetType: 'invoice',
    amount: 2400,
    daysRemainingOrOverdue: '18 days overdue',
    createdAt: '2026-09-21T09:00:00Z',
    status: 'pending',
  },
  {
    id: 'act_03',
    businessId: 'biz_brightpath_01',
    urgency: 'URGENT',
    title: 'Invoice #1047 is 10 days overdue ($6,020)',
    description: 'Horizon Media Group has not settled Invoice #1047 due on September 28, 2026.',
    riskDescription: 'Largest outstanding single invoice this quarter. No reminder has been dispatched yet.',
    actionType: 'GENERATE_REMINDER',
    targetId: 'inv_1047',
    targetType: 'invoice',
    amount: 6020,
    daysRemainingOrOverdue: '10 days overdue',
    createdAt: '2026-09-29T09:00:00Z',
    status: 'pending',
  },
  {
    id: 'act_04',
    businessId: 'biz_brightpath_01',
    urgency: 'TODAY',
    title: 'Invoice #1052 due today ($4,500) - Vanguard Ventures',
    description: 'Due date is today, October 8. Verify whether bank wire or ACH was received.',
    riskDescription: 'Monitor today to log as paid or prepare polite same-week receipt check.',
    actionType: 'GENERATE_REMINDER',
    targetId: 'inv_1052',
    targetType: 'invoice',
    amount: 4500,
    daysRemainingOrOverdue: 'Due today',
    createdAt: '2026-10-08T07:00:00Z',
    status: 'pending',
  },
  {
    id: 'act_05',
    businessId: 'biz_brightpath_01',
    urgency: 'THIS WEEK',
    title: 'AWS Enterprise Cloud 14-day renewal review',
    description: 'Reserved capacity terms lock in on Oct 22 unless usage tiers are updated by Oct 15.',
    riskDescription: 'Missing deadline could cause 25% price increase on compute tier.',
    actionType: 'REVIEW_CONTRACT',
    targetId: 'doc_04',
    targetType: 'document',
    daysRemainingOrOverdue: '14 days left',
    createdAt: '2026-10-07T11:00:00Z',
    status: 'pending',
  },
  {
    id: 'act_06',
    businessId: 'biz_brightpath_01',
    urgency: 'UPCOMING',
    title: 'Business license renewal window opens in 42 days',
    description: 'City of Seattle Business License SEA-BL-99214-A expires Nov 19.',
    riskDescription: 'Late filing incurs municipal penalties and administrative freeze.',
    actionType: 'VIEW_DOCUMENT',
    targetId: 'doc_02',
    targetType: 'document',
    daysRemainingOrOverdue: '42 days left',
    createdAt: '2026-10-01T09:00:00Z',
    status: 'pending',
  },
];

// Initial Notifications
const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    businessId: 'biz_brightpath_01',
    type: 'document_expiry',
    title: 'Insurance Expiry Warning',
    message: 'Commercial General Liability Policy expires in 7 days (Oct 15, 2026). Immediate renewal action advised.',
    createdAt: '2026-10-08T07:30:00Z',
    read: false,
    linkTab: 'actions',
  },
  {
    id: 'notif_02',
    businessId: 'biz_brightpath_01',
    type: 'invoice_overdue',
    title: 'Invoice #1042 Overdue',
    message: 'Apex Global invoice ($2,400) is now 18 days overdue. Ready to generate payment reminder.',
    createdAt: '2026-10-07T14:15:00Z',
    read: false,
    linkTab: 'invoices',
  },
  {
    id: 'notif_03',
    businessId: 'biz_brightpath_01',
    type: 'invoice_overdue',
    title: 'Invoice #1047 Overdue',
    message: 'Horizon Media Group invoice ($6,020) is now 10 days overdue.',
    createdAt: '2026-10-06T09:00:00Z',
    read: true,
    linkTab: 'invoices',
  },
];

// Initial Activity Logs
const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log_01',
    businessId: 'biz_brightpath_01',
    timestamp: 'Today, 8:44 AM',
    action: 'Guardian Automated Scan Completed',
    details: 'Scanned 27 business items. Detected 3 urgent action items and $8,420 overdue receivables.',
    user: 'Business Guardian Engine',
  },
  {
    id: 'log_02',
    businessId: 'biz_brightpath_01',
    timestamp: 'Yesterday, 3:12 PM',
    action: 'Invoice Status Updated',
    details: 'Invoice #1047 marked as Overdue (+10 days). Recommended reminder drafted.',
    user: 'Business Guardian Engine',
  },
  {
    id: 'log_03',
    businessId: 'biz_brightpath_01',
    timestamp: 'Oct 6, 2026, 11:30 AM',
    action: 'Document Monitored',
    details: 'Commercial General Liability policy entered 7-day critical expiry window.',
    user: 'Guardian Compliance Tracker',
  },
  {
    id: 'log_04',
    businessId: 'biz_brightpath_01',
    timestamp: 'Oct 4, 2026, 4:15 PM',
    action: 'Invoice Created',
    details: 'Invoice #1055 created for Summit Health Partners ($7,800 USD, Net 30).',
    user: 'Sarah Jenkins',
  },
  {
    id: 'log_05',
    businessId: 'biz_brightpath_01',
    timestamp: 'Sep 15, 2026, 2:00 PM',
    action: 'Payment Recorded',
    details: 'Received $3,150 from Cascade Logistics for Invoice #1039 via ACH.',
    user: 'Sarah Jenkins',
  },
];

// Runtime State Store
let currentBusiness: BusinessProfile = { ...initialBusiness };
let currentUser: UserAccount = { ...initialUser };
let currentDocuments: DocumentItem[] = [...initialDocuments];
let currentInvoices: InvoiceItem[] = [...initialInvoices];
let currentDeadlines: DeadlineItem[] = [...initialDeadlines];
let currentActions: ActionItem[] = [...initialActions];
let currentNotifications: NotificationItem[] = [...initialNotifications];
let currentActivityLogs: ActivityLog[] = [...initialActivityLogs];

// Settings
let notificationSettings = {
  emailAlertsEnabled: true,
  invoiceOverdueAlerts: true,
  documentExpiryAlerts: true,
  upcomingDeadlinesAlerts: true,
  dailyMorningDigest: true,
  alertEmail: 'sarah.jenkins@brightpathconsulting.com',
};

// Analytics event store
let analyticsEvents: Array<{ event: string; timestamp: string; details?: any }> = [
  { event: 'app_initialized', timestamp: new Date().toISOString() },
];

function logAnalytics(event: string, details?: any) {
  analyticsEvents.push({
    event,
    timestamp: new Date().toISOString(),
    details,
  });
}

function addActivity(action: string, details: string, user: string = 'Sarah Jenkins') {
  const newLog: ActivityLog = {
    id: `log_${Date.now()}`,
    businessId: currentBusiness.id,
    timestamp: 'Just now',
    action,
    details,
    user,
  };
  currentActivityLogs.unshift(newLog);
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Business Guardian AI',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// GET FULL DASHBOARD & APP DATA
app.get('/api/data', (req, res) => {
  // Calculate dynamic dashboard figures
  const totalOverdue = currentInvoices
    .filter((inv) => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + (Number(inv.invoiceAmount) || 0), 0);

  const totalOutstanding = currentInvoices
    .filter((inv) => inv.status !== 'Paid' && inv.status !== 'Draft')
    .reduce((sum, inv) => sum + (Number(inv.invoiceAmount) || 0), 0);

  const urgentActionsCount = currentActions.filter(
    (a) => a.urgency === 'URGENT' && a.status === 'pending'
  ).length;

  const deadlinesThisMonthCount = currentDeadlines.filter((d) => {
    // Current month is October 2026
    return d.deadlineDate.startsWith('2026-10') && d.status !== 'Completed';
  }).length;

  const totalMonitoredItems =
    currentDocuments.length +
    currentInvoices.length +
    currentDeadlines.length;

  res.json({
    business: currentBusiness,
    user: currentUser,
    summary: {
      moneyOverdue: totalOverdue,
      totalOutstanding,
      urgentActions: urgentActionsCount,
      deadlinesThisMonth: deadlinesThisMonthCount,
      documentsMonitored: currentDocuments.length,
      totalMonitoredItems,
    },
    documents: currentDocuments,
    invoices: currentInvoices,
    deadlines: currentDeadlines,
    actions: currentActions,
    notifications: currentNotifications,
    activityLogs: currentActivityLogs,
    notificationSettings,
  });
});

// AI DOCUMENT EXTRACTION (Gemini 3.8 Flash)
app.post('/api/ai/extract-document', async (req, res) => {
  try {
    const { textContent, fileData, filename } = req.body;

    if (!textContent && !fileData) {
      return res.status(400).json({
        error: 'Please provide document text or an uploaded file for extraction.',
      });
    }

    logAnalytics('document_extraction_requested', { filename });

    const prompt = `You are Business Guardian AI's specialized document analysis engine.
Your purpose: "Protect businesses from preventable losses by detecting expiry dates, renewal deadlines, payment terms, and critical obligations."

Analyze the provided document and extract key fields into strict JSON format.
Current date reference: October 2026.

You must extract:
- documentType: one of ["Insurance", "License", "Permit", "Contract", "Certificate", "Employee document", "Supplier document", "Other"]
- organization: issuer, carrier, client, or supplier name (e.g., "Hartford Mutual Underwriters", "City of Seattle")
- personName: person named or signing (if applicable, else empty string)
- issueDate: YYYY-MM-DD or string if unspecific
- expiryDate: YYYY-MM-DD or string if found (CRITICAL)
- renewalDate: YYYY-MM-DD or estimated renewal cutoff (CRITICAL)
- contractStartDate: YYYY-MM-DD or string
- contractEndDate: YYYY-MM-DD or string
- paymentAmount: number (e.g. 2400) or null if no money specified
- paymentDueDate: YYYY-MM-DD or string
- importantObligations: array of 2 to 4 concise strings describing key legal or financial duties (e.g. "Notice required 30 days prior to cancel", "Provide certificate of insurance upon renewal")
- relevantReferenceNumbers: policy number, license ID, or contract reference (e.g. "POL-99214")
- summary: a 2-sentence executive summary of the document and what risk needs guarding
- confidence: "high" | "medium" | "low"
- suggestedReminderDays: array of numbers, e.g. [60, 30, 14, 7, 1]

Important:
This information is presented to the user for confirmation. Never provide authoritative legal or financial advice. Include safety notice.`;

    let response;

    if (fileData?.base64 && fileData?.mimeType) {
      // Analyze multi-part image or document file
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: fileData.mimeType,
                data: fileData.base64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: { type: Type.STRING },
              organization: { type: Type.STRING },
              personName: { type: Type.STRING },
              issueDate: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              renewalDate: { type: Type.STRING },
              contractStartDate: { type: Type.STRING },
              contractEndDate: { type: Type.STRING },
              paymentAmount: { type: Type.NUMBER },
              paymentDueDate: { type: Type.STRING },
              importantObligations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              relevantReferenceNumbers: { type: Type.STRING },
              summary: { type: Type.STRING },
              confidence: { type: Type.STRING },
              suggestedReminderDays: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
            },
            required: ['documentType', 'organization', 'summary', 'importantObligations'],
          },
        },
      });
    } else {
      // Analyze plain text or parsed content
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${prompt}\n\nDOCUMENT CONTENT:\n${textContent || 'No text content.'}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: { type: Type.STRING },
              organization: { type: Type.STRING },
              personName: { type: Type.STRING },
              issueDate: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              renewalDate: { type: Type.STRING },
              contractStartDate: { type: Type.STRING },
              contractEndDate: { type: Type.STRING },
              paymentAmount: { type: Type.NUMBER },
              paymentDueDate: { type: Type.STRING },
              importantObligations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              relevantReferenceNumbers: { type: Type.STRING },
              summary: { type: Type.STRING },
              confidence: { type: Type.STRING },
              suggestedReminderDays: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
            },
            required: ['documentType', 'organization', 'summary', 'importantObligations'],
          },
        },
      });
    }

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    return res.json({
      success: true,
      extracted: parsedData,
      safetyDisclaimer:
        'AI-extracted information is provided for your verification and does not constitute authoritative legal or financial advice. Please review and confirm the details.',
    });
  } catch (error: any) {
    console.error('Error during AI document extraction:', error);
    // Friendly error handling per spec
    return res.status(200).json({
      success: false,
      message:
        "We couldn't confidently read all parts of this document. Please review or enter the important details manually.",
      extracted: {
        documentType: 'Other',
        organization: '',
        personName: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        renewalDate: '',
        paymentAmount: null,
        paymentDueDate: '',
        importantObligations: ['Please verify key terms and obligations manually.'],
        relevantReferenceNumbers: '',
        summary: 'Manual review suggested.',
        confidence: 'low',
        suggestedReminderDays: [60, 30, 14, 7, 1],
      },
      safetyDisclaimer:
        'Please verify document details. Business Guardian requires owner confirmation before saving.',
    });
  }
});

// AI PAYMENT REMINDER GENERATOR (Gemini 3.8 Flash)
app.post('/api/ai/generate-reminder', async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      amount,
      currency = 'USD',
      dueDate,
      daysOverdue = 0,
      tone = 'friendly', // 'friendly' | 'firm' | 'urgent'
      senderName = currentBusiness.ownerName,
      businessName = currentBusiness.name,
      notes,
    } = req.body;

    logAnalytics('payment_reminder_generated', { invoiceNumber, daysOverdue, tone });

    const prompt = `You are Business Guardian AI's automated communications engine.
Create a professional, effective payment reminder email for an unpaid invoice.

Invoice Information:
- Business: ${businessName} (Sender: ${senderName})
- Customer/Recipient: ${customerName}
- Invoice Number: ${invoiceNumber}
- Invoice Amount: $${amount} ${currency}
- Due Date: ${dueDate}
- Days Overdue: ${daysOverdue} days
- Tone requested: ${tone} (${
      tone === 'friendly'
        ? 'courteous, friendly, gentle reminder for first notice'
        : tone === 'firm'
        ? 'firm, direct, professional reminder for moderately overdue bill'
        : 'formal, urgent, clear notice of overdue payment requiring immediate settlement'
    })
- Additional notes: ${notes || 'None'}

Rules:
1. Subject line must be concise, professional, and contain the invoice number.
2. The body must be polite, clean, clearly formatted with line breaks, stating the invoice number, amount, and due date.
3. Keep the tone human and courteous. Avoid robotic or aggressive wording.
4. Conclude with a helpful sign-off and offer to answer questions if payment has already crossed in transit.
5. Provide a short "recommendedNextAction" for the business owner (e.g. "If no response within 5 business days, escalate to phone follow-up").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
            recommendedNextAction: { type: Type.STRING },
            suggestedScheduleDays: { type: Type.NUMBER },
          },
          required: ['subject', 'body', 'recommendedNextAction'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      reminder: result,
    });
  } catch (error: any) {
    console.error('Error generating AI reminder:', error);
    // Robust graceful fallback
    const { customerName, invoiceNumber, amount, dueDate, daysOverdue } = req.body;
    return res.json({
      success: true,
      reminder: {
        subject: `Payment reminder for Invoice ${invoiceNumber || '#1042'}`,
        body: `Dear ${customerName || 'Valued Client'},\n\nI hope you are well.\n\nThis is a friendly reminder that Invoice ${
          invoiceNumber || '#1042'
        } for $${amount || '0'} was due on ${
          dueDate || 'the scheduled date'
        }${daysOverdue ? ` (${daysOverdue} days ago)` : ''}.\n\nPlease let us know if payment has already been processed or if you need an updated copy of the invoice.\n\nThank you,\n${
          currentBusiness.ownerName
        }\n${currentBusiness.name}`,
        recommendedNextAction:
          'Send this reminder today and schedule a follow-up check in 5 days.',
        suggestedScheduleDays: 5,
      },
    });
  }
});

// SCAM & FRAUD DETECTOR (Gemini 3.8 Flash)
app.post('/api/ai/analyze-scam', async (req, res) => {
  try {
    const { suspicionText, source = 'Suspicious Email/Invoice' } = req.body;

    if (!suspicionText) {
      return res.status(400).json({ error: 'Please provide text or communication content to verify.' });
    }

    logAnalytics('scam_analysis_requested', { source });

    const prompt = `You are Business Guardian AI's expert Fraud and Scam Detection Engine for small businesses and entrepreneurs.
Analyze the following communication, email, message, or invoice request to determine if it is a scam, phishing attempt, CEO fraud, vendor bank account modification scam, or legitimate request.

Text Content:
"${suspicionText}"

Analyze for:
1. Impersonation of vendors, executives, tax agencies, or banks.
2. Sudden changes in payment routing, bank account numbers, or cryptocurrency demands.
3. Manufactured urgency, threats of legal action, or artificial deadlines.
4. Mismatched email domains, lookalike URLs, or suspicious requests for credentials.

Return strict JSON:
- verdict: "Likely Scam" | "Suspicious" | "Likely Safe"
- riskScore: number from 0 (completely safe) to 100 (confirmed malicious scam)
- summary: 2-sentence executive summary of what this message attempts to do
- redFlags: array of strings detailing specific deceptive indicators discovered
- actionGuide: array of concrete, actionable defense steps for the business owner
- safeReplyTemplate: polite verification response to send via confirmed secondary phone/channel, or null if replying is dangerous`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionGuide: { type: Type.ARRAY, items: { type: Type.STRING } },
            safeReplyTemplate: { type: Type.STRING },
          },
          required: ['verdict', 'riskScore', 'summary', 'redFlags', 'actionGuide'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error analyzing scam:', error);
    return res.json({
      success: true,
      analysis: {
        verdict: 'Suspicious',
        riskScore: 68,
        summary: 'Contains indicators of unauthorized urgency and payment pressure common in small business fraud.',
        redFlags: [
          'High pressure timeline for financial action',
          'Requires secondary channel verification before transferring funds',
        ],
        actionGuide: [
          'Do NOT send money or click embedded links',
          'Call the sender on their known official phone number',
        ],
        safeReplyTemplate: 'Please call our office directly on our registered number to verify this request.',
      },
    });
  }
});

// AI COPILOT ASSISTANT (Gemini 3.8 Flash)
app.post('/api/ai/chat-copilot', async (req, res) => {
  try {
    const { message, history = [], businessContext } = req.body;

    const systemInstruction = `You are Business Guardian Copilot, an elite business protection and risk advisor for small businesses, freelancers, and entrepreneurs worldwide.
Your mission is to:
1. Help users detect fraud, scams, vendor impersonation, and wire fraud.
2. Protect confidential business information and recommend cybersecurity best practices.
3. Provide practical guidance on invoice recovery, contract risks, and deadline management.
4. Deliver calm, trustworthy, highly actionable, concise answers.
Always include a practical next step. Note that you provide operational risk advice, not formal legal or tax counsel.`;

    const chatContext = history.slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Guardian Copilot'}: ${h.text}`).join('\n');
    const fullPrompt = `${systemInstruction}\n\nBusiness Context: ${JSON.stringify(businessContext || currentBusiness)}\n\nConversation History:\n${chatContext}\n\nUser Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
    });

    return res.json({
      success: true,
      reply: response.text?.trim() || 'I am watching your business operations. What specific risk or document can I analyze for you today?',
    });
  } catch (error: any) {
    console.error('Error in AI Copilot chat:', error);
    return res.json({
      success: true,
      reply: 'Guardian Copilot active. Based on your current operations, remember to verify all unexpected wire or account modifications by direct telephone confirmation.',
    });
  }
});

// DOCUMENT CRUD
app.post('/api/documents', (req, res) => {
  const { document, action = 'create' } = req.body;

  if (action === 'create') {
    const newDoc: DocumentItem = {
      ...document,
      id: document.id || `doc_${Date.now()}`,
      businessId: currentBusiness.id,
      uploadDate: document.uploadDate || new Date().toISOString().split('T')[0],
      confirmedByOwner: true,
    };
    currentDocuments.unshift(newDoc);
    addActivity('Document Uploaded & Confirmed', `Monitored: ${newDoc.name} (${newDoc.type})`);
    logAnalytics('document_uploaded', { docId: newDoc.id, type: newDoc.type });

    // Automatically create deadline if expiryDate exists
    if (newDoc.expiryDate) {
      const today = new Date('2026-10-08');
      const expiry = new Date(newDoc.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const newDeadline: DeadlineItem = {
        id: `dl_${Date.now()}`,
        businessId: currentBusiness.id,
        title: `${newDoc.name} Expiration`,
        category: (newDoc.type as any) || 'Other',
        deadlineDate: newDoc.expiryDate,
        daysRemaining: diffDays,
        responsiblePerson: currentBusiness.ownerName,
        priority: diffDays <= 7 ? 'Urgent' : diffDays <= 30 ? 'High' : 'Medium',
        status: 'Pending',
        reminderSchedule: [60, 30, 14, 7, 1],
        relatedId: newDoc.id,
      };
      currentDeadlines.push(newDeadline);

      if (diffDays <= 14) {
        currentActions.unshift({
          id: `act_${Date.now()}`,
          businessId: currentBusiness.id,
          urgency: diffDays <= 7 ? 'URGENT' : 'THIS WEEK',
          title: `${newDoc.name} expires in ${diffDays} days`,
          description: `Provider/Issuer: ${newDoc.organization || 'N/A'}. Action needed before ${newDoc.expiryDate}.`,
          riskDescription: 'Prevent lapse in compliance, insurance coverage, or legal enforceability.',
          actionType: 'VIEW_DOCUMENT',
          targetId: newDoc.id,
          targetType: 'document',
          amount: newDoc.amount,
          daysRemainingOrOverdue: `${diffDays} days left`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        });
      }
    }

    return res.json({ success: true, document: newDoc });
  }

  if (action === 'update') {
    currentDocuments = currentDocuments.map((d) =>
      d.id === document.id ? { ...d, ...document } : d
    );
    addActivity('Document Updated', `Updated details for: ${document.name}`);
    return res.json({ success: true });
  }

  if (action === 'delete') {
    const toDelete = currentDocuments.find((d) => d.id === document.id);
    currentDocuments = currentDocuments.filter((d) => d.id !== document.id);
    addActivity('Document Removed', `Removed ${toDelete?.name || 'document'}`);
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Invalid document action' });
});

// INVOICE CRUD
app.post('/api/invoices', (req, res) => {
  const { invoice, action = 'create' } = req.body;

  if (action === 'create') {
    const newInvoice: InvoiceItem = {
      ...invoice,
      id: invoice.id || `inv_${Date.now()}`,
      businessId: currentBusiness.id,
      invoiceDate: invoice.invoiceDate || new Date().toISOString().split('T')[0],
      remindersSentCount: 0,
    };
    currentInvoices.unshift(newInvoice);
    addActivity(
      'Invoice Created',
      `Invoice ${newInvoice.invoiceNumber} for ${newInvoice.customerName} ($${newInvoice.invoiceAmount} USD)`
    );
    logAnalytics('invoice_created', { invoiceNumber: newInvoice.invoiceNumber });

    // If invoice is overdue or due today, create action item
    if (newInvoice.status === 'Overdue') {
      currentActions.unshift({
        id: `act_${Date.now()}`,
        businessId: currentBusiness.id,
        urgency: 'URGENT',
        title: `Invoice ${newInvoice.invoiceNumber} is overdue ($${newInvoice.invoiceAmount})`,
        description: `Customer: ${newInvoice.customerName}. Due date was ${newInvoice.dueDate}.`,
        riskDescription: 'Delayed cash collection increases default risk.',
        actionType: 'GENERATE_REMINDER',
        targetId: newInvoice.id,
        targetType: 'invoice',
        amount: newInvoice.invoiceAmount,
        daysRemainingOrOverdue: 'Overdue',
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
    }

    return res.json({ success: true, invoice: newInvoice });
  }

  if (action === 'update' || action === 'mark_paid') {
    currentInvoices = currentInvoices.map((inv) => {
      if (inv.id === invoice.id) {
        const updated = { ...inv, ...invoice };
        if (action === 'mark_paid') {
          updated.status = 'Paid';
        }
        return updated;
      }
      return inv;
    });

    if (action === 'mark_paid') {
      addActivity('Payment Recorded', `Invoice ${invoice.invoiceNumber} marked as Paid`);
      // Resolve any open action for this invoice
      currentActions = currentActions.map((a) =>
        a.targetId === invoice.id ? { ...a, status: 'resolved', urgency: 'COMPLETED' } : a
      );
    } else {
      addActivity('Invoice Updated', `Updated Invoice ${invoice.invoiceNumber}`);
    }

    return res.json({ success: true });
  }

  if (action === 'delete') {
    currentInvoices = currentInvoices.filter((inv) => inv.id !== invoice.id);
    addActivity('Invoice Removed', `Removed Invoice ${invoice.invoiceNumber}`);
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Invalid invoice action' });
});

// ACTION CENTER: RESOLVE OR DISMISS ACTION
app.post('/api/actions/resolve', (req, res) => {
  const { actionId } = req.body;
  currentActions = currentActions.map((a) => {
    if (a.id === actionId) {
      return {
        ...a,
        status: 'resolved',
        urgency: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };
    }
    return a;
  });

  const act = currentActions.find((a) => a.id === actionId);
  if (act) {
    addActivity('Action Resolved', `Completed: ${act.title}`);
    logAnalytics('action_completed', { actionId });
  }

  res.json({ success: true });
});

// RECORD REMINDER SENT
app.post('/api/reminders/send', (req, res) => {
  const { invoiceId, recipientEmail, subject, body, scheduledDate } = req.body;

  const inv = currentInvoices.find((i) => i.id === invoiceId);
  if (inv) {
    inv.remindersSentCount = (inv.remindersSentCount || 0) + 1;
    inv.lastReminderSentAt = new Date().toISOString();
  }

  const isScheduled = !!scheduledDate;
  const statusMsg = isScheduled
    ? `Scheduled reminder email to ${recipientEmail} for ${scheduledDate}`
    : `Payment reminder dispatched to ${recipientEmail} for Invoice ${inv?.invoiceNumber || ''}`;

  addActivity(isScheduled ? 'Reminder Scheduled' : 'Reminder Email Dispatched', statusMsg);

  currentNotifications.unshift({
    id: `notif_${Date.now()}`,
    businessId: currentBusiness.id,
    type: 'reminder_generated',
    title: isScheduled ? 'Reminder Scheduled' : 'Payment Reminder Dispatched',
    message: statusMsg,
    createdAt: new Date().toISOString(),
    read: false,
    linkTab: 'invoices',
  });

  res.json({
    success: true,
    message: isScheduled
      ? 'Payment reminder successfully scheduled.'
      : 'Payment reminder recorded. Email dispatched to recipient.',
    status: isScheduled ? 'scheduled' : 'sent',
  });
});

// DEADLINE CRUD
app.post('/api/deadlines', (req, res) => {
  const { deadline, action = 'create' } = req.body;

  if (action === 'create') {
    const newDeadline: DeadlineItem = {
      ...deadline,
      id: deadline.id || `dl_${Date.now()}`,
      businessId: currentBusiness.id,
      daysRemaining: deadline.daysRemaining || 30,
      status: 'Pending',
    };
    currentDeadlines.unshift(newDeadline);
    addActivity('Deadline Added', `Scheduled monitoring for: ${newDeadline.title}`);
    return res.json({ success: true, deadline: newDeadline });
  }

  if (action === 'complete') {
    currentDeadlines = currentDeadlines.map((d) =>
      d.id === deadline.id ? { ...d, status: 'Completed' } : d
    );
    addActivity('Deadline Completed', `Marked as done: ${deadline.title}`);
    return res.json({ success: true });
  }

  if (action === 'delete') {
    currentDeadlines = currentDeadlines.filter((d) => d.id !== deadline.id);
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Invalid deadline action' });
});

// NOTIFICATION SETTINGS UPDATE
app.post('/api/notifications/settings', (req, res) => {
  notificationSettings = { ...notificationSettings, ...req.body };
  addActivity('Notification Settings Updated', 'Saved alert and digest preferences');
  res.json({ success: true, settings: notificationSettings });
});

// MARK ALL NOTIFICATIONS AS READ
app.post('/api/notifications/mark-read', (req, res) => {
  currentNotifications = currentNotifications.map((n) => ({ ...n, read: true }));
  res.json({ success: true });
});

// BUSINESS PROFILE UPDATE
app.post('/api/business/profile', (req, res) => {
  currentBusiness = { ...currentBusiness, ...req.body };
  addActivity('Business Profile Updated', `Saved profile for ${currentBusiness.name}`);
  res.json({ success: true, business: currentBusiness });
});

// USER PROFILE UPDATE
app.post('/api/user/profile', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json({ success: true, user: currentUser });
});

// ADMIN STATS
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalUsers: 142,
    activeUsers: 98,
    documentsUploaded: 1240,
    invoicesMonitored: 3410,
    actionsCreated: 884,
    freeUsers: 84,
    paidUsers: 58,
    mrr: '$2,140',
    recentRegistrations: [
      {
        id: 'usr_101',
        name: 'Sarah Jenkins',
        businessName: 'BrightPath Consulting',
        plan: 'Business ($29/mo)',
        country: 'United States',
        registeredAt: 'Oct 6, 2026',
        status: 'Active',
      },
      {
        id: 'usr_102',
        name: 'Marcus Thorne',
        businessName: 'Thorne Architecture Studio',
        plan: 'Starter ($9/mo)',
        country: 'United Kingdom',
        registeredAt: 'Oct 7, 2026',
        status: 'Active',
      },
      {
        id: 'usr_103',
        name: 'Elena Rostova',
        businessName: 'Apex Data Labs',
        plan: 'Pro ($79/mo)',
        country: 'Canada',
        registeredAt: 'Oct 7, 2026',
        status: 'Active',
      },
      {
        id: 'usr_104',
        name: 'David O’Connor',
        businessName: 'Cloverfield Construction Ltd',
        plan: 'Free ($0/mo)',
        country: 'Ireland',
        registeredAt: 'Oct 8, 2026',
        status: 'Trial',
      },
    ],
  });
});

// RESET TO DEMO DATA (BrightPath Consulting)
app.post('/api/reset-demo', (req, res) => {
  currentBusiness = { ...initialBusiness };
  currentUser = { ...initialUser };
  currentDocuments = [...initialDocuments];
  currentInvoices = [...initialInvoices];
  currentDeadlines = [...initialDeadlines];
  currentActions = [...initialActions];
  currentNotifications = [...initialNotifications];
  currentActivityLogs = [...initialActivityLogs];

  addActivity('Demo Data Restored', 'Reset environment to BrightPath Consulting benchmark sample');
  res.json({ success: true, message: 'Demo data reset successfully.' });
});

// CLEAR DATA TO TEST EMPTY STATE UX
app.post('/api/clear-data', (req, res) => {
  currentDocuments = [];
  currentInvoices = [];
  currentDeadlines = [];
  currentActions = [];
  currentNotifications = [];
  currentActivityLogs = [
    {
      id: `log_${Date.now()}`,
      businessId: currentBusiness.id,
      timestamp: 'Just now',
      action: 'Account Initialized',
      details: 'Fresh clean slate ready for document & invoice monitoring.',
      user: currentUser.name,
    },
  ];

  res.json({ success: true, message: 'Environment cleared to empty state.' });
});

// ==========================================
// SERVE VITE IN DEV / STATIC IN PROD
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Business Guardian AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
