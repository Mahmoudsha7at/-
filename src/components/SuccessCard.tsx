import React from 'react';
import { CheckCircle2, Printer, PlusCircle, ArrowLeft, BookOpen, Award, FileText, ExternalLink } from 'lucide-react';

interface SuccessCardProps {
  data: {
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
  };
  onNewRegistration: () => void;
  onGoHome: () => void;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  data,
  onNewRegistration,
  onGoHome
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      
      {/* Top Banner Alert (Hidden in print) */}
      <div className="no-print bg-emerald-50 border border-emerald-300 text-emerald-950 p-5 rounded-3xl flex items-center gap-4 mb-8 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-emerald-900">تم تسجيل المتسابق بنجاح!</h3>
          <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-relaxed">
            تم حفظ السجل في Google Sheets الرسمي وتوجيه طلب توليد الاستمارة في Google Drive. يرجى طباعة أو حفظ هذه البطاقة لإحضارها يوم الاختبار.
          </p>
        </div>
      </div>

      {/* Official Printable Contestant Slip */}
      <div className="bg-white rounded-3xl border-2 border-slate-900/10 shadow-2xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Slip Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 text-center relative border-b-4 border-amber-500">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold tracking-widest text-amber-400">مؤسسة التيسير الخيرية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">بطاقة متسابق مسابقة القرآن الكريم</h2>
          <p className="text-xs text-slate-300 mt-1">قرية المنزلة — دورة عام 2026 م</p>

          <div className="mt-4 inline-block bg-slate-800/90 border border-amber-500/40 px-5 py-2 rounded-xl">
            <span className="text-xs text-slate-400 block font-medium">رقم الطلب الرسمي:</span>
            <span className="text-lg sm:text-xl font-mono font-black text-amber-300 tracking-wider">
              {data.orderNumber}
            </span>
          </div>
        </div>

        {/* Slip Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">اسم المتسابق:</span>
              <span className="text-base sm:text-lg font-black text-slate-900">{data.fullName}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">رقم المتسابق بالمسار:</span>
              <span className="text-base sm:text-lg font-mono font-black text-amber-600">
                {data.contestantNumber || '001'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">مقدار الحفظ (المستوى):</span>
              <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                <Award className="w-4 h-4 text-amber-600" />
                {data.level}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">السن المحسوب:</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{data.age}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">اسم المحفظ / الشيخ:</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{data.teacher}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">رقم الموبايل:</span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-800" dir="ltr">
                {data.phone}
              </span>
            </div>
          </div>

          {/* PDF Generation Status indicator */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-slate-700 block">حالة استمارة Google Drive:</span>
                <span className="text-xs text-slate-500">
                  {data.pdfStatus === 'جاهز' ? 'تم إنشاء الاستمارة الرسمية بنجاح' : 'قيد المعالجة في السحابة'}
                </span>
              </div>
            </div>

            {data.pdfUrl ? (
              <a
                href={data.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-print inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl transition-colors shadow-xs"
              >
                <span>فتح ملف PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                {data.pdfStatus}
              </span>
            )}
          </div>

          {/* Instructions Box */}
          <div className="text-xs text-slate-500 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
            <p className="font-bold text-amber-950 mb-1">تعليمات الحضور للاختبار:</p>
            <p>
              يرجى الاحتفاظ بهذه البطاقة وإحضار أصل شهادة الميلاد أو بطاقة الرقم القومي يوم الاختبار في مقر مؤسسة التيسير الخيرية بالمسجد الكبير بقرية المنزلة.
            </p>
          </div>

          {/* Barcode Simulator for Authenticity */}
          <div className="pt-2 text-center select-none opacity-80">
            <div className="inline-block h-10 w-64 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_10px)] mb-1"></div>
            <p className="text-[10px] font-mono tracking-widest text-slate-400">{data.orderNumber} - AL-TAYSEER</p>
          </div>

        </div>

      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="no-print mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>طباعة بطاقة المتسابق (Print)</span>
        </button>

        <button
          onClick={onNewRegistration}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تسجيل متسابق آخر</span>
        </button>

        <button
          onClick={onGoHome}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

    </div>
  );
};
