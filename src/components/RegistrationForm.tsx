import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Loader2,
  Clock
} from 'lucide-react';
import { api } from '../services/api.js';

interface RegistrationFormProps {
  initialLevel?: string;
  onSuccess: (data: {
    orderNumber: string;
    contestantNumber?: string;
    fullName: string;
    level: string;
    pdfStatus: string;
    pdfUrl?: string;
    timestamp: string;
    phone: string;
    teacher: string;
    age: string;
  }) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialLevel,
  onSuccess,
  onCancel
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [teacher, setTeacher] = useState('');
  const [level, setLevel] = useState(initialLevel || 'القرآن كاملاً بالتجويد');
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');

  // Computed Age
  const [calculatedAgeText, setCalculatedAgeText] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<{ orderNumber?: string; message?: string } | null>(null);

  const levels = [
    'القرآن كاملاً بالتجويد',
    'القرآن كاملاً',
    'خمسة عشر جزءًا',
    'عشرة أجزاء',
    'خمسة أجزاء',
    'ربع يس'
  ];

  // Digits normalizer
  const normalizeDigits = (val: string) => {
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let str = val;
    for (let i = 0; i < 10; i++) {
      str = str.split(arabic[i]).join(String(i));
    }
    return str;
  };

  // Extract DOB from Egyptian National ID
  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = normalizeDigits(e.target.value).replace(/\D/g, '').slice(0, 14);
    setNationalId(clean);
    setDuplicateWarning(null);

    // If 14 digits reached, auto-extract birth date
    if (clean.length === 14) {
      const centuryDigit = parseInt(clean[0], 10);
      if (centuryDigit === 2 || centuryDigit === 3) {
        const century = centuryDigit === 2 ? 1900 : 2000;
        const year = century + parseInt(clean.substring(1, 3), 10);
        const month = clean.substring(3, 5);
        const day = clean.substring(5, 7);
        const iso = `${year}-${month}-${day}`;
        if (!isNaN(new Date(iso).getTime())) {
          setBirthDate(iso);
        }
      }
    }
  };

  // Re-calculate age accurately whenever birthDate changes
  useEffect(() => {
    if (!birthDate) {
      setCalculatedAgeText('');
      return;
    }

    try {
      const birth = new Date(birthDate);
      const today = new Date();
      if (isNaN(birth.getTime()) || birth > today) {
        setCalculatedAgeText('تاريخ غير صالح');
        return;
      }

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      if (years > 0) {
        setCalculatedAgeText(`${years} سنة${months > 0 ? ` و ${months} شهر` : ''}`);
      } else {
        setCalculatedAgeText(`${months} شهر و ${days} يوم`);
      }
    } catch {
      setCalculatedAgeText('');
    }
  }, [birthDate]);

  // Client Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!fullName.trim()) {
      newErrors.fullName = 'الاسم رباعي مطلوب';
    } else if (nameParts.length < 3) {
      newErrors.fullName = 'يرجى كتابة الاسم ثلاثياً أو رباعياً على الأقل';
    }

    const cleanPhone = normalizeDigits(phone).replace(/[\s-+]/g, '');
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!cleanPhone) {
      newErrors.phone = 'رقم الموبايل مطلوب';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'رقم الموبايل يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015';
    }

    if (!teacher.trim()) {
      newErrors.teacher = 'اسم المحفظ أو الشيخ المشرف مطلوب';
    }

    if (!level) {
      newErrors.level = 'يرجى اختيار مقدار الحفظ';
    }

    if (!nationalId) {
      newErrors.nationalId = 'الرقم القومي مطلوب';
    } else if (nationalId.length !== 14) {
      newErrors.nationalId = 'الرقم القومي يجب أن يتكون من 14 رقماً بالضبط';
    }

    if (!birthDate) {
      newErrors.birthDate = 'تاريخ الميلاد مطلوب';
    } else if (new Date(birthDate) > new Date()) {
      newErrors.birthDate = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateWarning(null);

    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        phone: normalizeDigits(phone).replace(/[\s-+]/g, ''),
        teacher: teacher.trim(),
        level,
        nationalId: normalizeDigits(nationalId).trim(),
        birthDate,
        notes: notes.trim(),
        idempotencyKey: `sub_${Date.now()}_${nationalId}`
      };

      const result = await api.submitRegistration(payload);

      onSuccess({
        orderNumber: result.orderNumber,
        contestantNumber: result.contestantNumber,
        fullName: payload.fullName,
        level: payload.level,
        pdfStatus: result.pdfStatus,
        pdfUrl: result.pdfUrl,
        timestamp: new Date().toISOString(),
        phone: payload.phone,
        teacher: payload.teacher,
        age: calculatedAgeText
      });

    } catch (err: any) {
      console.error('Registration submission error:', err);
      if (err.duplicate) {
        setDuplicateWarning({
          orderNumber: err.orderNumber,
          message: err.message || 'هذا الرقم القومي مسجل بالفعل في المسابقة.'
        });
      } else if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      
      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold">استمارة تسجيل متسابق جديد</h2>
              <p className="text-xs sm:text-sm text-slate-300">مسابقة مؤسسة التيسير الخيرية بقرية المنزلة 2026</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            جميع الحقول المعلمة بـ (*) مطلوبة ويتم التحقق منها تلقائياً، وسيتم إنشاء استمارة المتسابق في Google Drive بعد الحفظ مباشرة.
          </p>
        </div>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="m-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">تنبيه: الرقم القومي مسجل مسبقاً</h4>
              <p className="text-xs mt-1 leading-relaxed">{duplicateWarning.message}</p>
              {duplicateWarning.orderNumber && (
                <p className="text-xs font-mono font-bold mt-2 bg-amber-100/80 px-2 py-1 rounded inline-block">
                  رقم الطلب السابق: {duplicateWarning.orderNumber}
                </p>
              )}
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errors.general && (
          <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm font-bold">{errors.general}</div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* 1. Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              الاسم رباعي <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                placeholder="اكتب الاسم رباعياً كما هو مدون في شهادة الميلاد"
                className={`w-full pr-11 pl-4 py-3 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                  errors.fullName 
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                    : 'border-slate-300 focus:border-amber-500'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName}</p>
            )}
          </div>

          {/* 2. Phone & Teacher Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                رقم الموبايل / واتساب <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => {
                    setPhone(normalizeDigits(e.target.value));
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="01012345678"
                  className={`w-full pr-11 pl-4 py-3 rounded-xl border text-sm text-slate-900 text-right transition-colors focus:outline-none ${
                    errors.phone 
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                      : 'border-slate-300 focus:border-amber-500'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                اسم الشيخ / المحفظ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => {
                    setTeacher(e.target.value);
                    if (errors.teacher) setErrors({ ...errors, teacher: '' });
                  }}
                  placeholder="اسم المحفظ أو الكتّاب التابع له"
                  className={`w-full pr-11 pl-4 py-3 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                    errors.teacher 
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                      : 'border-slate-300 focus:border-amber-500'
                  }`}
                />
              </div>
              {errors.teacher && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.teacher}</p>
              )}
            </div>
          </div>

          {/* 3. Level Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              مقدار الحفظ (المستوى) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value);
                  if (errors.level) setErrors({ ...errors, level: '' });
                }}
                className={`w-full pr-11 pl-4 py-3 rounded-xl border text-sm font-semibold text-slate-900 bg-white transition-colors focus:outline-none appearance-none ${
                  errors.level 
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                    : 'border-slate-300 focus:border-amber-500'
                }`}
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            {errors.level && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.level}</p>
            )}
          </div>

          {/* 4. National ID & Birth Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                الرقم القومي (14 رقماً) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  dir="ltr"
                  value={nationalId}
                  onChange={handleNationalIdChange}
                  placeholder="30405151234567"
                  className={`w-full pr-11 pl-4 py-3 rounded-xl border text-sm text-slate-900 text-right tracking-wider transition-colors focus:outline-none ${
                    errors.nationalId 
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                      : 'border-slate-300 focus:border-amber-500'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">يُستخرج من شهادة الميلاد المميكنة للناشئة</p>
              {errors.nationalId && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.nationalId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                تاريخ الميلاد <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    if (errors.birthDate) setErrors({ ...errors, birthDate: '' });
                  }}
                  className={`w-full pr-11 pl-4 py-3 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                    errors.birthDate 
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' 
                      : 'border-slate-300 focus:border-amber-500'
                  }`}
                />
              </div>
              {errors.birthDate && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.birthDate}</p>
              )}
            </div>
          </div>

          {/* 5. Read-Only Calculated Age Display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-slate-500 block">السن المحسوب تلقائياً:</span>
                <span className="text-base font-extrabold text-slate-900">
                  {calculatedAgeText || 'يُحسب تلقائياً بمجرد إدخال تاريخ الميلاد'}
                </span>
              </div>
            </div>
            <span className="text-xs bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
              حساب دقيق باليوم والشهر
            </span>
          </div>

          {/* 6. Notes (Optional) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات خاصة بالمتسابق أو الترتيبات..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              إلغاء والعودة
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base px-8 py-3.5 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جارٍ الحفظ وتوليد الاستمارة...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>تأكيد التسجيل وإصدار الاستمارة</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
