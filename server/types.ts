/**
 * Server and Shared Types
 * Al-Tayseer Quran Memorization Competition
 */

export type QuranLevel = 
  | 'القرآن كاملاً بالتجويد'
  | 'القرآن كاملاً'
  | 'خمسة عشر جزءًا'
  | 'عشرة أجزاء'
  | 'خمسة أجزاء'
  | 'ربع يس';

export type RegistrationStatus = 
  | 'جديد'
  | 'قيد المراجعة'
  | 'مكتمل'
  | 'مقبول'
  | 'غير مكتمل'
  | 'مرفوض';

export type PDFStatus = 
  | 'جاهز'
  | 'قيد المعالجة'
  | 'بحاجة للتحديث'
  | 'فشل'
  | 'غير متوفر';

export interface ParticipantInput {
  fullName: string;
  phone: string;
  teacher: string;
  level: QuranLevel | string;
  nationalId: string;
  birthDate: string; // YYYY-MM-DD
  notes?: string;
  idempotencyKey?: string;
}

export interface ParticipantRecord {
  rowIndex: number;
  timestamp: string;
  fullName: string;
  phone: string;
  teacher: string;
  level: QuranLevel | string;
  nationalId: string; // masked in public views
  age: string | number;
  birthDate: string;
  fileUrl: string;
  orderNumber: string; // e.g. QRC-2026-00001
  status: RegistrationStatus;
  pdfStatus: PDFStatus;
  pdfFileId?: string;
  pdfDate?: string;
  notes?: string;
  fingerprint?: string;
  contestantNumber?: string; // e.g. 001
}

export interface DashboardStats {
  totalParticipants: number;
  todayRegistrations: number;
  readyPdfs: number;
  missingPdfs: number;
  failedPdfs: number;
  statusCounts: Record<string, number>;
  levelCounts: Record<string, number>;
  timeline: Record<string, number>;
}

export interface WorkspaceHealth {
  spreadsheet: { ok: boolean; title?: string; message: string };
  sheetTab: { ok: boolean; rowCount?: number; message: string };
  docsTemplate: { ok: boolean; name?: string; message: string };
  driveRootFolder: { ok: boolean; name?: string; message: string };
  allOk: boolean;
  isMock?: boolean;
}

export interface CompetitionSettings {
  competitionTitle: string;
  organizationName: string;
  villageName: string;
  registrationOpen: boolean;
  registrationDeadline: string;
  competitionStartDate: string;
  contactPhone: string;
  contactLocation: string;
  rules: string[];
  faq: Array<{ question: string; answer: string }>;
  levels: string[];
  allowedAdminEmails: string[];
  appsScriptUrl?: string;
  appsScriptSecretConfigured?: boolean;
}

export interface FilterParams {
  level?: string;
  teacher?: string;
  status?: string;
  pdfStatus?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
