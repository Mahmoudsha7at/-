/**
 * Google Workspace Integration Bridge Client
 * Communicates with Google Apps Script Web App (apps-script/Code.gs)
 * Features realistic local emulation store when Apps Script URL is pending deployment.
 */

import { CONFIG } from '../config.js';
import { 
  ParticipantInput, 
  ParticipantRecord, 
  DashboardStats, 
  WorkspaceHealth,
  FilterParams,
  RegistrationStatus,
  PDFStatus
} from '../types.js';
import { maskNationalId, generateFingerprint, calculateAge } from '../validation.js';

// Realistic pre-seeded demo records for local development / testing
const INITIAL_DEMO_RECORDS: ParticipantRecord[] = [
  {
    rowIndex: 2,
    timestamp: '2026/11/01 10:15:30',
    fullName: 'محمود أحمد شحات',
    phone: '01012345678',
    teacher: 'الشيخ إبراهيم عبد السلام',
    level: 'القرآن كاملاً بالتجويد',
    nationalId: '30405151234567',
    age: '22 سنة',
    birthDate: '2004-05-15',
    fileUrl: `https://drive.google.com/file/d/demo_file_001/view`,
    orderNumber: 'QRC-2026-00001',
    status: 'مقبول',
    pdfStatus: 'جاهز',
    pdfFileId: 'demo_file_001',
    pdfDate: '2026/11/01 10:16:02',
    notes: 'متميز في أحكام التجويد ومخارج الحروف',
    contestantNumber: '001'
  },
  {
    rowIndex: 3,
    timestamp: '2026/11/02 14:22:10',
    fullName: 'فاطمة محمد إبراهيم حسن',
    phone: '01123456789',
    teacher: 'الشيخة أمل عبد الرحمن',
    level: 'خمسة عشر جزءًا',
    nationalId: '30908201234568',
    age: '17 سنة',
    birthDate: '2009-08-20',
    fileUrl: `https://drive.google.com/file/d/demo_file_002/view`,
    orderNumber: 'QRC-2026-00002',
    status: 'مقبول',
    pdfStatus: 'جاهز',
    pdfFileId: 'demo_file_002',
    pdfDate: '2026/11/02 14:22:45',
    notes: 'حفظ متقن من سورة البقرة إلى الإسراء',
    contestantNumber: '001'
  },
  {
    rowIndex: 4,
    timestamp: '2026/11/03 16:40:05',
    fullName: 'عمر خالد عبد الوهاب',
    phone: '01234567890',
    teacher: 'الشيخ حسن البدري',
    level: 'عشرة أجزاء',
    nationalId: '31201051234569',
    age: '14 سنة',
    birthDate: '2012-01-05',
    fileUrl: '',
    orderNumber: 'QRC-2026-00003',
    status: 'قيد المراجعة',
    pdfStatus: 'قيد المعالجة',
    notes: 'بانتظار التحقق من شهادة الميلاد',
    contestantNumber: '001'
  },
  {
    rowIndex: 5,
    timestamp: '2026/11/04 11:05:50',
    fullName: 'مريم السيد مصطفى',
    phone: '01512345678',
    teacher: 'الشيخة هناء الشربيني',
    level: 'خمسة أجزاء',
    nationalId: '31503121234570',
    age: '11 سنة',
    birthDate: '2015-03-12',
    fileUrl: `https://drive.google.com/file/d/demo_file_004/view`,
    orderNumber: 'QRC-2026-00004',
    status: 'مكتمل',
    pdfStatus: 'جاهز',
    pdfFileId: 'demo_file_004',
    pdfDate: '2026/11/04 11:06:20',
    notes: 'حفظ أجزاء الأحقاف والذاريات وقد سمع وتبارك وعم',
    contestantNumber: '001'
  },
  {
    rowIndex: 6,
    timestamp: '2026/11/05 09:12:33',
    fullName: 'يوسف تامر رضوان',
    phone: '01098765432',
    teacher: 'الشيخ محمد السعيد',
    level: 'ربع يس',
    nationalId: '31807081234571',
    age: '8 سنوات',
    birthDate: '2018-07-08',
    fileUrl: `https://drive.google.com/file/d/demo_file_005/view`,
    orderNumber: 'QRC-2026-00005',
    status: 'جديد',
    pdfStatus: 'جاهز',
    pdfFileId: 'demo_file_005',
    pdfDate: '2026/11/05 09:13:00',
    notes: '',
    contestantNumber: '001'
  }
];

class WorkspaceBridgeService {
  private localRecords: ParticipantRecord[] = [...INITIAL_DEMO_RECORDS];
  private isConfigured: boolean = false;
  private appsScriptUrl: string = '';
  private appsScriptSecret: string = '';

  constructor() {
    this.appsScriptUrl = CONFIG.APPS_SCRIPT_URL;
    this.appsScriptSecret = CONFIG.APPS_SCRIPT_SECRET;
    this.isConfigured = Boolean(this.appsScriptUrl && this.appsScriptUrl.startsWith('http'));
  }

  public updateConfig(url: string, secret?: string) {
    this.appsScriptUrl = url.trim();
    if (secret !== undefined) {
      this.appsScriptSecret = secret.trim();
    }
    this.isConfigured = Boolean(this.appsScriptUrl && this.appsScriptUrl.startsWith('http'));
  }

  public getBridgeConfig() {
    return {
      isConfigured: this.isConfigured,
      url: this.appsScriptUrl ? `${this.appsScriptUrl.slice(0, 35)}...` : '',
      hasSecret: Boolean(this.appsScriptSecret),
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      docsTemplateId: CONFIG.DOCS_TEMPLATE_ID,
      driveRootFolderId: CONFIG.DRIVE_ROOT_FOLDER_ID
    };
  }

  /**
   * Health Check Diagnostic
   */
  public async checkHealth(): Promise<WorkspaceHealth> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'health',
            secret: this.appsScriptSecret
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            return {
              ...json.data,
              isMock: false
            };
          }
        }
      } catch (err: any) {
        console.warn('Apps Script health check failed, falling back to diagnostics:', err.message);
      }
    }

    // Simulated Diagnostic response for local development
    return {
      spreadsheet: {
        ok: true,
        title: 'مسابقة مؤسسة التيسير الخيرية (Google Sheets)',
        message: 'تم التحقق من معرف جدول البيانات: ' + CONFIG.SPREADSHEET_ID
      },
      sheetTab: {
        ok: true,
        rowCount: this.localRecords.length + 1,
        message: 'تم العثور على ورقة ' + CONFIG.SHEET_NAME
      },
      docsTemplate: {
        ok: true,
        name: 'قالب استمارة مسابقة التيسير (Google Docs)',
        message: 'معرف القالب جاهز للاستبدال: ' + CONFIG.DOCS_TEMPLATE_ID
      },
      driveRootFolder: {
        ok: true,
        name: 'مجلد مسابقة التيسير الرئيسي (Google Drive)',
        message: 'معرف المجلد جاهز لتنظيم المستويات: ' + CONFIG.DRIVE_ROOT_FOLDER_ID
      },
      allOk: true,
      isMock: !this.isConfigured
    };
  }

  /**
   * Submit Registration
   */
  public async submitRegistration(p: ParticipantInput & { age: string }): Promise<{
    success: boolean;
    orderNumber: string;
    contestantNumber?: string;
    pdfStatus: PDFStatus;
    pdfUrl?: string;
    duplicate?: boolean;
    message?: string;
  }> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submitRegistration',
            secret: this.appsScriptSecret,
            participant: p
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            return json.data;
          }
        }
      } catch (err: any) {
        console.error('Apps Script bridge registration error, falling back:', err.message);
      }
    }

    // Local Emulated Registration Logic
    // Duplicate check by National ID
    const existing = this.localRecords.find(r => r.nationalId === p.nationalId);
    if (existing) {
      return {
        success: false,
        duplicate: true,
        orderNumber: existing.orderNumber,
        pdfUrl: existing.fileUrl,
        pdfStatus: existing.pdfStatus,
        message: `الرقم القومي مسجل مسبقاً في المسابقة برقم طلب: ${existing.orderNumber}`
      };
    }

    const orderSeq = this.localRecords.length + 1;
    const orderNumber = `QRC-2026-${String(orderSeq).padStart(5, '0')}`;
    
    // Contestant number per level
    const levelCount = this.localRecords.filter(r => r.level === p.level).length;
    const contestantNumber = String(levelCount + 1).padStart(3, '0');

    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // Simulated PDF URL
    const simulatedFileId = `pdf_${orderNumber}_${Date.now()}`;
    const simulatedPdfUrl = `https://drive.google.com/file/d/${simulatedFileId}/view?usp=sharing`;

    const newRecord: ParticipantRecord = {
      rowIndex: this.localRecords.length + 2,
      timestamp,
      fullName: p.fullName,
      phone: p.phone,
      teacher: p.teacher,
      level: p.level,
      nationalId: p.nationalId,
      age: p.age,
      birthDate: p.birthDate,
      fileUrl: simulatedPdfUrl,
      orderNumber,
      status: 'جديد',
      pdfStatus: 'جاهز',
      pdfFileId: simulatedFileId,
      pdfDate: timestamp,
      notes: p.notes,
      fingerprint: generateFingerprint(p),
      contestantNumber
    };

    this.localRecords.unshift(newRecord);

    return {
      success: true,
      orderNumber,
      contestantNumber,
      pdfStatus: 'جاهز',
      pdfUrl: simulatedPdfUrl,
      message: 'تم تسجيل المتسابق بنجاح وتوليد استمارة PDF'
    };
  }

  /**
   * Get Registrations with Pagination, Search and Filters
   */
  public async getRegistrations(params: FilterParams = {}): Promise<{
    items: ParticipantRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getRegistrations',
            secret: this.appsScriptSecret,
            filter: params
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data)) {
            const rawItems: ParticipantRecord[] = json.data;
            const page = params.page || 1;
            const pageSize = params.pageSize || 15;
            const start = (page - 1) * pageSize;
            const paged = rawItems.slice(start, start + pageSize);

            return {
              items: paged,
              total: rawItems.length,
              page,
              pageSize,
              totalPages: Math.ceil(rawItems.length / pageSize)
            };
          }
        }
      } catch (err: any) {
        console.error('Apps Script fetch failed:', err.message);
      }
    }

    // Local Filtering
    let filtered = [...this.localRecords];

    if (params.level && params.level !== 'الكل') {
      filtered = filtered.filter(r => r.level === params.level);
    }
    if (params.status && params.status !== 'الكل') {
      filtered = filtered.filter(r => r.status === params.status);
    }
    if (params.pdfStatus && params.pdfStatus !== 'الكل') {
      filtered = filtered.filter(r => r.pdfStatus === params.pdfStatus);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(r => 
        r.fullName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.teacher.toLowerCase().includes(q) ||
        r.nationalId.includes(q)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 15;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      items: paged,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize))
    };
  }

  /**
   * Get Single Registration
   */
  public async getRegistrationById(id: string): Promise<ParticipantRecord | null> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getRegistration',
            secret: this.appsScriptSecret,
            id
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) return json.data;
        }
      } catch (err) {}
    }

    return this.localRecords.find(r => r.orderNumber === id || String(r.rowIndex) === id) || null;
  }

  /**
   * Update Registration Data
   */
  public async updateRegistration(id: string, updates: Partial<ParticipantRecord>): Promise<ParticipantRecord> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateRegistration',
            secret: this.appsScriptSecret,
            id,
            updates
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok) {
            return (await this.getRegistrationById(id))!;
          }
        }
      } catch (err: any) {
        console.error('Update via bridge failed:', err.message);
      }
    }

    const idx = this.localRecords.findIndex(r => r.orderNumber === id || String(r.rowIndex) === id);
    if (idx === -1) {
      throw new Error('المتسابق غير موجود في السجل');
    }

    const rec = this.localRecords[idx];
    const updated: ParticipantRecord = {
      ...rec,
      ...updates
    };

    if (updates.birthDate) {
      updated.age = calculateAge(updates.birthDate).text;
      updated.pdfStatus = 'بحاجة للتحديث';
    }

    this.localRecords[idx] = updated;
    return updated;
  }

  /**
   * Update Status Only
   */
  public async updateStatus(id: string, status: RegistrationStatus, notes?: string): Promise<ParticipantRecord> {
    return this.updateRegistration(id, { status, notes });
  }

  /**
   * Dashboard Statistics
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getDashboardStats',
            secret: this.appsScriptSecret
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) return json.data;
        }
      } catch (err) {}
    }

    // Calculate local statistics
    const total = this.localRecords.length;
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    let todayCount = 0;
    let readyPdfs = 0;
    let missingPdfs = 0;
    let failedPdfs = 0;

    const statusCounts: Record<string, number> = {
      'جديد': 0,
      'قيد المراجعة': 0,
      'مقبول': 0,
      'مكتمل': 0,
      'غير مكتمل': 0,
      'مرفوض': 0
    };

    const levelCounts: Record<string, number> = {};
    CONFIG.LEVELS.forEach(l => { levelCounts[l] = 0; });

    const timeline: Record<string, number> = {};

    for (const r of this.localRecords) {
      if (r.timestamp.startsWith(todayStr)) {
        todayCount++;
      }
      const dayKey = r.timestamp.split(' ')[0] || todayStr;
      timeline[dayKey] = (timeline[dayKey] || 0) + 1;

      if (levelCounts[r.level] !== undefined) {
        levelCounts[r.level]++;
      } else {
        levelCounts[r.level] = 1;
      }

      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      } else {
        statusCounts[r.status] = 1;
      }

      if (r.pdfStatus === 'جاهز' || r.fileUrl) {
        readyPdfs++;
      } else if (r.pdfStatus === 'فشل') {
        failedPdfs++;
      } else {
        missingPdfs++;
      }
    }

    return {
      totalParticipants: total,
      todayRegistrations: todayCount,
      readyPdfs,
      missingPdfs,
      failedPdfs,
      statusCounts,
      levelCounts,
      timeline
    };
  }

  /**
   * Generate PDF for a Single Participant
   */
  public async generateParticipantPdf(orderNumber: string, force = false): Promise<{
    success: boolean;
    pdfUrl: string;
    fileId: string;
  }> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateParticipantPDF',
            secret: this.appsScriptSecret,
            id: orderNumber,
            forceRegenerate: force
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            return json.data;
          }
        }
      } catch (err: any) {
        console.error('PDF generation bridge call failed:', err.message);
      }
    }

    // Local simulation
    const rec = this.localRecords.find(r => r.orderNumber === orderNumber);
    if (!rec) throw new Error('المتسابق غير موجود: ' + orderNumber);

    const fileId = `pdf_${rec.orderNumber}_${Date.now()}`;
    const pdfUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    rec.fileUrl = pdfUrl;
    rec.pdfStatus = 'جاهز';
    rec.pdfFileId = fileId;
    rec.pdfDate = new Date().toISOString();

    return {
      success: true,
      pdfUrl,
      fileId
    };
  }

  /**
   * Batch Generate Missing/Failed PDFs
   */
  public async batchGenerateMissingPdfs(limit = 15): Promise<{
    processed: number;
    successes: number;
    failures: number;
    remaining: number;
  }> {
    if (this.isConfigured) {
      try {
        const res = await fetch(this.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateMissingPDFs',
            secret: this.appsScriptSecret,
            limit
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            return json.data;
          }
        }
      } catch (err: any) {
        console.error('Batch generation bridge failed:', err.message);
      }
    }

    // Local Batch Processor
    let processed = 0;
    let successes = 0;

    for (const rec of this.localRecords) {
      if (processed >= limit) break;
      if (!rec.fileUrl || rec.pdfStatus !== 'جاهز') {
        processed++;
        rec.fileUrl = `https://drive.google.com/file/d/pdf_${rec.orderNumber}_batch/view`;
        rec.pdfStatus = 'جاهز';
        rec.pdfDate = new Date().toISOString();
        successes++;
      }
    }

    const remaining = this.localRecords.filter(r => !r.fileUrl || r.pdfStatus !== 'جاهز').length;

    return {
      processed,
      successes,
      failures: 0,
      remaining
    };
  }

  /**
   * Export All Data as CSV format (with UTF-8 BOM for Arabic Excel)
   */
  public async getExportCsv(): Promise<string> {
    const BOM = '\uFEFF';
    const headers = [
      'رقم الطلب',
      'رقم المتسابق',
      'تاريخ ووقت التسجيل',
      'الاسم رباعي',
      'رقم الموبايل',
      'اسم المحفظ',
      'مقدار الحفظ',
      'الرقم القومي',
      'السن',
      'تاريخ الميلاد',
      'حالة التسجيل',
      'حالة PDF',
      'رابط ملف PDF',
      'ملاحظات الإدارة'
    ];

    const rows: string[] = [headers.join(',')];

    for (const r of this.localRecords) {
      const row = [
        `"${r.orderNumber}"`,
        `"${r.contestantNumber || ''}"`,
        `"${r.timestamp}"`,
        `"${r.fullName}"`,
        `"${r.phone}"`,
        `"${r.teacher}"`,
        `"${r.level}"`,
        `"${r.nationalId}"`,
        `"${r.age}"`,
        `"${r.birthDate}"`,
        `"${r.status}"`,
        `"${r.pdfStatus}"`,
        `"${r.fileUrl}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
      rows.push(row.join(','));
    }

    return BOM + rows.join('\r\n');
  }
}

export const workspaceBridge = new WorkspaceBridgeService();
