import {
  BusinessProfile,
  UserAccount,
  DocumentItem,
  InvoiceItem,
  DeadlineItem,
  ActionItem,
  NotificationItem,
  ActivityLog,
  DashboardSummary,
  ExtractedDocumentData,
} from '../types';

export interface AppDataResponse {
  business: BusinessProfile;
  user: UserAccount;
  summary: DashboardSummary;
  documents: DocumentItem[];
  invoices: InvoiceItem[];
  deadlines: DeadlineItem[];
  actions: ActionItem[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  notificationSettings: {
    emailAlertsEnabled: boolean;
    invoiceOverdueAlerts: boolean;
    documentExpiryAlerts: boolean;
    upcomingDeadlinesAlerts: boolean;
    dailyMorningDigest: boolean;
    alertEmail: string;
  };
}

export const api = {
  async getAppData(): Promise<AppDataResponse> {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Failed to fetch application data');
    return res.json();
  },

  async extractDocument(payload: {
    textContent?: string;
    fileData?: { base64: string; mimeType: string; filename: string };
    filename?: string;
  }): Promise<{
    success: boolean;
    extracted: ExtractedDocumentData;
    message?: string;
    safetyDisclaimer: string;
  }> {
    const res = await fetch('/api/ai/extract-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Document extraction request failed');
    return res.json();
  },

  async generatePaymentReminder(payload: {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    currency?: string;
    dueDate: string;
    daysOverdue?: number;
    tone?: 'friendly' | 'firm' | 'urgent';
    senderName?: string;
    businessName?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    reminder: {
      subject: string;
      body: string;
      recommendedNextAction: string;
      suggestedScheduleDays?: number;
    };
  }> {
    const res = await fetch('/api/ai/generate-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Reminder generation failed');
    return res.json();
  },

  async analyzeScam(payload: {
    suspicionText: string;
    source?: string;
  }): Promise<{
    success: boolean;
    analysis: {
      verdict: 'Likely Scam' | 'Suspicious' | 'Likely Safe';
      riskScore: number;
      summary: string;
      redFlags: string[];
      actionGuide: string[];
      safeReplyTemplate?: string;
    };
  }> {
    const res = await fetch('/api/ai/analyze-scam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Scam analysis failed');
    return res.json();
  },

  async chatCopilot(payload: {
    message: string;
    history?: any[];
    businessContext?: any;
  }): Promise<{
    success: boolean;
    reply: string;
  }> {
    const res = await fetch('/api/ai/chat-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Copilot chat failed');
    return res.json();
  },

  async createDocument(document: Partial<DocumentItem>): Promise<{ success: boolean; document: DocumentItem }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', document }),
    });
    return res.json();
  },

  async updateDocument(document: Partial<DocumentItem>): Promise<{ success: boolean }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', document }),
    });
    return res.json();
  },

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', document: { id } }),
    });
    return res.json();
  },

  async createInvoice(invoice: Partial<InvoiceItem>): Promise<{ success: boolean; invoice: InvoiceItem }> {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', invoice }),
    });
    return res.json();
  },

  async updateInvoice(invoice: Partial<InvoiceItem>): Promise<{ success: boolean }> {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', invoice }),
    });
    return res.json();
  },

  async markInvoicePaid(id: string, invoiceNumber: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', invoice: { id, invoiceNumber } }),
    });
    return res.json();
  },

  async deleteInvoice(id: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', invoice: { id } }),
    });
    return res.json();
  },

  async resolveAction(actionId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/actions/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId }),
    });
    return res.json();
  },

  async sendReminder(payload: {
    invoiceId: string;
    recipientEmail: string;
    subject: string;
    body: string;
    scheduledDate?: string;
  }): Promise<{ success: boolean; message: string; status: string }> {
    const res = await fetch('/api/reminders/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async createDeadline(deadline: Partial<DeadlineItem>): Promise<{ success: boolean; deadline: DeadlineItem }> {
    const res = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', deadline }),
    });
    return res.json();
  },

  async completeDeadline(id: string, title: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', deadline: { id, title } }),
    });
    return res.json();
  },

  async deleteDeadline(id: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', deadline: { id } }),
    });
    return res.json();
  },

  async updateNotificationSettings(settings: any): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.json();
  },

  async updateBusinessProfile(profile: Partial<BusinessProfile>): Promise<{ success: boolean; business: BusinessProfile }> {
    const res = await fetch('/api/business/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async updateUserProfile(profile: Partial<UserAccount>): Promise<{ success: boolean; user: UserAccount }> {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async getAdminStats(): Promise<any> {
    const res = await fetch('/api/admin/stats');
    return res.json();
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/reset-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.json();
  },

  async clearData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/clear-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.json();
  },
};
