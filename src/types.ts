/**
 * Frontend Type Definitions
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

export interface ParticipantFormState {
  fullName: string;
  phone: string;
  teacher: string;
  level: string;
  nationalId: string;
  birthDate: string;
  notes: string;
}

export interface ParticipantRecord {
  rowIndex: number;
  timestamp: string;
  fullName: string;
  phone: string;
  teacher: string;
  level: string;
  nationalId: string;
  maskedNationalId?: string;
  age: string | number;
  birthDate: string;
  fileUrl: string;
  orderNumber: string;
  status: RegistrationStatus;
  pdfStatus: PDFStatus;
  pdfFileId?: string;
  pdfDate?: string;
  notes?: string;
  contestantNumber?: string;
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
}
