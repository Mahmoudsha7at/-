/**
 * Data Validation and Normalization Utilities
 * Egyptian National ID, Mobile Numbers, Age Calculation & Sanitization
 */

import crypto from 'crypto';
import { ParticipantInput } from './types.js';

/**
 * Normalizes Eastern Arabic digits (٠١٢٣٤٥٦٧٨٩) to standard ASCII digits (0123456789)
 */
export function normalizeDigits(input: string | number | undefined | null): string {
  if (input === null || input === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let str = String(input);
  for (let i = 0; i < 10; i++) {
    str = str.split(arabicDigits[i]).join(String(i));
  }
  return str.trim();
}

/**
 * Clean & normalize whitespace in Arabic strings
 */
export function normalizeArabicText(text: string | undefined | null): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Validates Egyptian Mobile Number (010, 011, 012, 015 + 8 digits = 11 digits)
 */
export function validateEgyptianPhone(phoneRaw: string): { isValid: boolean; normalized: string; error?: string } {
  const normalized = normalizeDigits(phoneRaw).replace(/[\s-+]/g, '');
  
  // Handles +2010..., 002010..., or direct 010...
  let localNum = normalized;
  if (localNum.startsWith('20')) {
    localNum = localNum.slice(2);
  } else if (localNum.startsWith('+20')) {
    localNum = localNum.slice(3);
  } else if (localNum.startsWith('0020')) {
    localNum = localNum.slice(4);
  }

  const phoneRegex = /^01[0125][0-9]{8}$/;
  if (!phoneRegex.test(localNum)) {
    return {
      isValid: false,
      normalized: localNum,
      error: 'رقم الموبايل يجب أن يتكون من 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015)'
    };
  }

  return { isValid: true, normalized: localNum };
}

/**
 * Validates Egyptian National ID (14 digits) and extracts Birth Date
 */
export function validateEgyptianNationalId(idRaw: string): {
  isValid: boolean;
  normalized: string;
  birthDate?: string; // YYYY-MM-DD
  error?: string;
} {
  const normalized = normalizeDigits(idRaw).replace(/[\s-]/g, '');

  if (!/^[0-9]{14}$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: 'الرقم القومي يجب أن يتكون من 14 رقماً صحيحاً'
    };
  }

  const centuryDigit = parseInt(normalized[0], 10);
  if (centuryDigit !== 2 && centuryDigit !== 3) {
    return {
      isValid: false,
      normalized,
      error: 'الرقم القومي غير صالح (الخانة الأولى تدل على القرن)'
    };
  }

  const century = centuryDigit === 2 ? 1900 : 2000;
  const year = century + parseInt(normalized.substring(1, 3), 10);
  const month = parseInt(normalized.substring(3, 5), 10);
  const day = parseInt(normalized.substring(5, 7), 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return {
      isValid: false,
      normalized,
      error: 'تاريخ الميلاد المستخرج من الرقم القومي غير صحيح'
    };
  }

  const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    isValid: true,
    normalized,
    birthDate
  };
}

/**
 * Accurate Arabic age calculation from birth date
 */
export function calculateAge(birthDateStr: string): { years: number; months: number; days: number; text: string } {
  if (!birthDateStr) return { years: 0, months: 0, days: 0, text: '0' };

  const parts = birthDateStr.split(/[-/]/).map(p => parseInt(normalizeDigits(p), 10));
  let y = 0, m = 0, d = 0;

  if (parts.length === 3) {
    if (parts[0] > 1900) {
      y = parts[0];
      m = parts[1] - 1;
      d = parts[2];
    } else {
      d = parts[0];
      m = parts[1] - 1;
      y = parts[2];
    }
  }

  const birth = new Date(y, m, d);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    // Days in previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const text = years > 0 
    ? `${years} سنة${months > 0 ? ` و ${months} شهر` : ''}`
    : `${months} شهر`;

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), text };
}

/**
 * Masks National ID for privacy (shows first 3 and last 3 digits)
 */
export function maskNationalId(nationalId: string): string {
  const norm = normalizeDigits(nationalId);
  if (norm.length !== 14) return norm;
  return `${norm.slice(0, 4)}******${norm.slice(-4)}`;
}

/**
 * Generates stable idempotency fingerprint
 */
export function generateFingerprint(p: ParticipantInput): string {
  const normNat = normalizeDigits(p.nationalId);
  const normName = normalizeArabicText(p.fullName);
  const normLevel = normalizeArabicText(p.level);
  return crypto.createHash('sha256').update(`${normNat}_${normName}_${normLevel}`).digest('hex');
}

/**
 * Full Participant Input Validation
 */
export function validateParticipantSubmission(p: ParticipantInput, allowedLevels: string[]): {
  isValid: boolean;
  errors: Record<string, string>;
  cleaned: ParticipantInput & { age: string; birthDate: string };
} {
  const errors: Record<string, string> = {};

  const fullName = normalizeArabicText(p.fullName);
  const nameParts = fullName.split(' ').filter(Boolean);
  if (!fullName) {
    errors.fullName = 'الاسم رباعي مطلوب';
  } else if (nameParts.length < 3) {
    errors.fullName = 'يرجى كتابة الاسم ثلاثياً أو رباعياً بالكامل';
  }

  const phoneRes = validateEgyptianPhone(p.phone);
  if (!phoneRes.isValid) {
    errors.phone = phoneRes.error || 'رقم الموبايل غير صحيح';
  }

  const teacher = normalizeArabicText(p.teacher);
  if (!teacher) {
    errors.teacher = 'اسم المحفظ مطلوب';
  }

  const level = normalizeArabicText(p.level);
  if (!level) {
    errors.level = 'يرجى اختيار مقدار الحفظ';
  } else if (allowedLevels.length > 0 && !allowedLevels.includes(level)) {
    errors.level = 'مقدار الحفظ المختار غير متاح في المسابقة';
  }

  const natRes = validateEgyptianNationalId(p.nationalId);
  if (!natRes.isValid) {
    errors.nationalId = natRes.error || 'الرقم القومي غير صحيح';
  }

  // Validate or extract birth date
  let birthDate = p.birthDate ? normalizeDigits(p.birthDate) : (natRes.birthDate || '');
  if (!birthDate) {
    errors.birthDate = 'تاريخ الميلاد مطلوب';
  } else {
    const bDate = new Date(birthDate);
    if (isNaN(bDate.getTime())) {
      errors.birthDate = 'صيغة تاريخ الميلاد غير صالحة';
    } else if (bDate > new Date()) {
      errors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
    }
  }

  const calculatedAge = calculateAge(birthDate).text;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleaned: {
      fullName,
      phone: phoneRes.normalized,
      teacher,
      level,
      nationalId: natRes.normalized,
      birthDate,
      age: calculatedAge,
      notes: p.notes ? normalizeArabicText(p.notes) : '',
      idempotencyKey: p.idempotencyKey
    }
  };
}
