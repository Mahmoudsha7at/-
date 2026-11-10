/**
 * API Client Service
 * Connects frontend with backend /api/* routes
 */

import { 
  CompetitionSettings, 
  ParticipantRecord, 
  DashboardStats, 
  WorkspaceHealth,
  RegistrationStatus 
} from '../types.js';

class ApiService {
  private adminToken: string | null = null;
  private adminEmail: string | null = null;

  constructor() {
    this.adminToken = localStorage.getItem('altayseer_admin_token');
    this.adminEmail = localStorage.getItem('altayseer_admin_email');
  }

  public setAdminAuth(token: string, email: string) {
    this.adminToken = token;
    this.adminEmail = email;
    localStorage.setItem('altayseer_admin_token', token);
    localStorage.setItem('altayseer_admin_email', email);
  }

  public clearAdminAuth() {
    this.adminToken = null;
    this.adminEmail = null;
    localStorage.removeItem('altayseer_admin_token');
    localStorage.removeItem('altayseer_admin_email');
  }

  public getAdminAuth() {
    return {
      isAuthenticated: Boolean(this.adminToken),
      email: this.adminEmail
    };
  }

  private getHeaders(customHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
      headers['x-admin-key'] = this.adminToken;
    }
    if (this.adminEmail) {
      headers['x-admin-email'] = this.adminEmail;
    }
    return headers;
  }

  /**
   * Public: Get Competition Settings
   */
  async getSettings(): Promise<CompetitionSettings> {
    const res = await fetch('/api/settings');
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Public: Check Google Workspace Health
   */
  async checkHealth(): Promise<WorkspaceHealth> {
    const res = await fetch('/api/health');
    const json = await res.json();
    return json.data;
  }

  /**
   * Public: Submit Registration Form
   */
  async submitRegistration(data: any): Promise<{
    orderNumber: string;
    contestantNumber?: string;
    fullName: string;
    level: string;
    pdfStatus: string;
    pdfUrl?: string;
  }> {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.message || 'حدث خطأ في التسجيل');
      (err as any).duplicate = json.duplicate;
      (err as any).orderNumber = json.orderNumber;
      (err as any).errors = json.errors;
      throw err;
    }
    return json.data;
  }

  /**
   * Public: Lookup Registration by Order Number
   */
  async lookupRegistration(orderNumber: string) {
    const res = await fetch(`/api/registrations/status/${encodeURIComponent(orderNumber)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Login
   */
  async adminLogin(email?: string, password?: string) {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'فشل تسجيل الدخول');
    this.setAdminAuth(json.token, json.user.email);
    return json.user;
  }

  /**
   * Admin: Verify Auth
   */
  async verifyAdminAuth() {
    if (!this.adminToken) return null;
    try {
      const res = await fetch('/api/admin/auth/verify', {
        headers: this.getHeaders()
      });
      const json = await res.json();
      return json.ok ? json.user : null;
    } catch {
      return null;
    }
  }

  /**
   * Admin: Get Dashboard Stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/admin/stats', {
      headers: this.getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Get Registrations
   */
  async getRegistrations(params: {
    level?: string;
    teacher?: string;
    status?: string;
    pdfStatus?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: ParticipantRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.level && params.level !== 'الكل') query.set('level', params.level);
    if (params.status && params.status !== 'الكل') query.set('status', params.status);
    if (params.pdfStatus && params.pdfStatus !== 'الكل') query.set('pdfStatus', params.pdfStatus);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await fetch(`/api/admin/registrations?${query.toString()}`, {
      headers: this.getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Get Single Participant
   */
  async getParticipant(id: string): Promise<ParticipantRecord> {
    const res = await fetch(`/api/admin/registrations/${encodeURIComponent(id)}`, {
      headers: this.getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Update Participant
   */
  async updateParticipant(id: string, updates: Partial<ParticipantRecord>) {
    const res = await fetch(`/api/admin/registrations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Update Registration Status
   */
  async updateStatus(id: string, status: RegistrationStatus, notes?: string) {
    const res = await fetch(`/api/admin/registrations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Generate or Regenerate PDF
   */
  async generatePdf(orderNumber: string, force = false) {
    const res = await fetch(`/api/admin/pdf/generate/${encodeURIComponent(orderNumber)}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ force })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Batch Process Missing PDFs
   */
  async batchGeneratePdfs(limit = 15) {
    const res = await fetch('/api/admin/pdf/batch', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ limit })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Download CSV Export
   */
  async downloadExportCsv() {
    const res = await fetch('/api/admin/export', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('فشل تصدير البيانات');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlTayseer_Quran_Participants_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Admin: Get Bridge Config
   */
  async getBridgeConfig() {
    const res = await fetch('/api/admin/bridge/config', {
      headers: this.getHeaders()
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Update Bridge Config
   */
  async updateBridgeConfig(url: string, secret?: string) {
    const res = await fetch('/api/admin/bridge/config', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url, secret })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  }

  /**
   * Admin: Update Competition Settings
   */
  async updateSettings(settings: Partial<CompetitionSettings>) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json.data;
  }
}

export const api = new ApiService();
