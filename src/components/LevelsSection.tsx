import React from 'react';
import { Award, BookOpen, Sparkles, Check, ArrowLeft } from 'lucide-react';

interface LevelsSectionProps {
  onSelectLevel: (level: string) => void;
}

export const LevelsSection: React.FC<LevelsSectionProps> = ({ onSelectLevel }) => {
  const levels = [
    {
      id: 'القرآن كاملاً بالتجويد',
      title: 'القرآن كاملاً بالتجويد',
      badge: 'المستوى الأسمى',
      color: 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'حفظ كتاب الله كاملاً (30 جزءاً) مع الإتقان التام لأحكام التجويد ومخارج الحروف والصفات والوقف والابتداء.',
      criteria: ['حفظ 30 جزءاً كاملاً', 'إتقان نظري وعملي لأحكام التجويد', 'أسئلة متشابهات واسترسال'],
      target: 'كافة الأعمار'
    },
    {
      id: 'القرآن كاملاً',
      title: 'القرآن كاملاً',
      badge: 'المستوى الأول',
      color: 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500',
      tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'حفظ القرآن الكريم كاملاً عن ظهر قلب مع مراعاة حسن التلاوة وضبط الكلمات القرآنية.',
      criteria: ['حفظ 30 جزءاً كاملاً', 'حسن الترتيل والصوت الحسن', 'قوة الحفظ وسرعة الاستحضار'],
      target: 'كافة الأعمار'
    },
    {
      id: 'خمسة عشر جزءًا',
      title: 'خمسة عشر جزءًا',
      badge: 'المستوى الثاني',
      color: 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'حفظ نصف القرآن الكريم (إما من سورة البقرة إلى سورة الإسراء، أو من سورة الكهف إلى سورة الناس).',
      criteria: ['حفظ 15 جزءاً متتالياً', 'أحكام التجويد الأساسية', 'الالتزام برسم المصحف'],
      target: 'حتى سن 18 عاماً'
    },
    {
      id: 'عشرة أجزاء',
      title: 'عشرة أجزاء',
      badge: 'المستوى الثالث',
      color: 'border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500',
      tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      description: 'حفظ ثلث القرآن الكريم (10 أجزاء متتالية) بضبط الحركات ومراعاة قواعد التلاوة السليمة.',
      criteria: ['حفظ 10 أجزاء متتالية', 'مخارج الحروف الصحيحة', 'اختبار في مقاطع متنوعة'],
      target: 'حتى سن 15 عاماً'
    },
    {
      id: 'خمسة أجزاء',
      title: 'خمسة أجزاء',
      badge: 'المستوى الرابع',
      color: 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500',
      tagColor: 'bg-rose-100 text-rose-900 border-rose-300',
      description: 'حفظ 5 أجزاء من القرآن الكريم (غالباً من سورة الأحقاف إلى سورة الناس - أجزاء الأحقاف والذاريات وقد سمع وتبارك وعم).',
      criteria: ['حفظ 5 أجزاء كاملة', 'سلامة النطق وتجنب اللحن الجلي', 'التشجيع على المتابعة'],
      target: 'حتى سن 12 عاماً'
    },
    {
      id: 'ربع يس',
      title: 'ربع يس',
      badge: 'براعم القرآن',
      color: 'border-teal-500/40 bg-teal-500/5 hover:border-teal-500',
      tagColor: 'bg-teal-100 text-teal-900 border-teal-300',
      description: 'مستوى مخصص للناشئة والبراعم لحفظ ربع يس (من سورة يس إلى نهاية سورة الناس - حوالي 8 أجزاء أخيرة).',
      criteria: ['حفظ من سورة يس إلى الناس', 'عذوبة الصوت وحسن الاستماع', 'جوائز تشجيعية خاصة'],
      target: 'حتى سن 10 سنوات'
    }
  ];

  return (
    <section id="levels" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>المسارات التنافسية المعتمدة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            مستويات حفظ القرآن الكريم في المسابقة
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600">
            تم تقسيم المسابقة إلى 6 مستويات رئيسية تناسب شتى الأعمار ومقادير الحفظ، ولكل مستوى مجلد تنظيمي مستقل وملفات معتمدة.
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((lvl) => (
            <div
              key={lvl.id}
              className={`flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border-2 transition-all duration-200 shadow-xs hover:shadow-md ${lvl.color}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${lvl.tagColor}`}>
                    {lvl.badge}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {lvl.target}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{lvl.title}</span>
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  {lvl.description}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block mb-1">معايير التقييم:</span>
                  {lvl.criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectLevel(lvl.id)}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-600 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors duration-150 group"
              >
                <span>سجل في مستوى {lvl.title}</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
