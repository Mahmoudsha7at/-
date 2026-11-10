import React, { useState } from 'react';
import { Award, BookOpen, CheckCircle2, Search, ArrowLeft, Star, Users, FileCheck } from 'lucide-react';

interface HeroProps {
  onStartRegistration: () => void;
  onViewLevels: () => void;
  onLookupOrder: (orderNumber: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartRegistration,
  onViewLevels,
  onLookupOrder
}) => {
  const [searchRef, setSearchRef] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      onLookupOrder(searchRef.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-12 pb-20 sm:pt-16 sm:pb-28">
      {/* Decorative Islamic Geometric subtle background grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Glow highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Quranic Verse */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-amber-500/30 text-amber-300 text-sm font-medium mb-6 shadow-inner">
            <span className="text-amber-400 font-serif text-base">﴿</span>
            <span className="font-quran text-base sm:text-lg">وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</span>
            <span className="text-amber-400 font-serif text-base">﴾</span>
            <span className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-200">سورة المزمل</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight mb-6">
            مسابقة مؤسسة التيسير الخيرية
            <span className="block mt-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              لحفظة القرآن الكريم بقرية المنزلة
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            منظومة إلكترونية متكاملة لتسجيل المتسابقين، تنظيم لجان التحكيم، وإصدار بطاقات واستمارات الاختبار الرسمية عبر الحفظ السحابي المؤتمت.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <button
              onClick={onStartRegistration}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-200 active:scale-98"
            >
              <Award className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              <span>سجل الآن في المسابقة</span>
              <ArrowLeft className="w-4 h-4 text-slate-900" />
            </button>

            <button
              onClick={onViewLevels}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold text-base px-7 py-4 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>استعراض مستويات الحفظ (6 مستويات)</span>
            </button>
          </div>

          {/* Quick Registration Tracker Lookup */}
          <div className="max-w-md mx-auto bg-slate-800/60 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  placeholder="لديك رقم طلب مسبق؟ (مثال: QRC-2026-00001)"
                  className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pr-10 pl-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                استعلام
              </button>
            </form>
          </div>

        </div>

        {/* Feature Badges Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">6 مستويات معتمدة</h4>
              <p className="text-xs text-slate-400 mt-0.5">من ربع يس حتى الختمة</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">توليد استمارة PDF</h4>
              <p className="text-xs text-slate-400 mt-0.5">مربوطة بـ Google Drive</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">نخبة من المحكّمين</h4>
              <p className="text-xs text-slate-400 mt-0.5">لجان متخصصة بالقراءات</p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">جوائز وتكريم</h4>
              <p className="text-xs text-slate-400 mt-0.5">حفل تكريم ختامي سنوي</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
