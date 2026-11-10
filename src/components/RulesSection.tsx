import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Calendar, MapPin, Award } from 'lucide-react';

export const RulesSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'اختيار المستوى المناسب',
      desc: 'يقوم المتسابق أو ولي أمره باختيار المستوى المتوافق مع مقدار الحفظ الفعلي والإتقان.'
    },
    {
      step: '02',
      title: 'ملء استمارة التسجيل الإلكتروني',
      desc: 'كتابة الاسم رباعياً، رقم الموبايل، اسم المحفظ، الرقم القومي المكون من 14 رقماً، وتاريخ الميلاد.'
    },
    {
      step: '03',
      title: 'تأكيد التسجيل وتوليد الاستمارة',
      desc: 'يقوم النظام بحفظ البيانات في سجل المسابقة بـ Google Sheets وإنشاء استمارة PDF الرسمية في Google Drive.'
    },
    {
      step: '04',
      title: 'طباعة بطاقة المتسابق والحضور',
      desc: 'الاحتفاظ برقم الطلب وحضور الاختبار في الموعد المحدد بمقر المؤسسة بقرية المنزلة.'
    }
  ];

  const rules = [
    'أن يكون المتسابق من أبناء قرية المنزلة أو المراكز والقرى المجاورة.',
    'يحق للمتسابق الاشتراك في مستوى واحد فقط في الدورة الحالية للمسابقة.',
    'الالتزام بالحضور في الموعد والمكان المحددين للاختبار النهائي ومعه بطاقة التسجيل.',
    'إحضار أصل شهادة الميلاد المميكنة أو بطاقة الرقم القومي للمطابقة والتأكد من السن.',
    'في حال ثبوت تسجيل بيانات غير دقيقة أو اشتراك في أكثر من مستوى يتم استبعاد المتسابق.',
    'قرارات لجنة التحكيم قطعية وتخضع لإشراف ومراجعة إدارة مؤسسة التيسير الخيرية.'
  ];

  return (
    <section id="rules" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>الضوابط والتعليمات المنظمة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            شروط وتعليمات الاشتراك في المسابقة
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600">
            يرجى قراءة الشروط والتعليمات التالية بعناية قبل البدء في تعبئة استمارة التسجيل.
          </p>
        </div>

        {/* 4 Steps Process */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-slate-900 mb-8 text-center flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>مراحل التسجيل والاشتراك</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div 
                key={idx} 
                className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-amber-400 transition-colors"
              >
                <div className="text-3xl font-black text-amber-500/40 mb-3 font-mono">
                  {s.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  {s.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Card & Notice */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">الشروط العامة للمتسابقين</h3>
            </div>

            <div className="space-y-4">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-amber-50 rounded-3xl p-7 border-2 border-amber-300/80 space-y-5">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold text-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>ملاحظات هامة جداً</span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-amber-900 leading-relaxed">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                <span>يتم إغلاق باب التسجيل فور اكتمال الأعداد المقررة لكل مستوى.</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                <span>مكان الاختبار: مقر مؤسسة التيسير الخيرية - المسجد الكبير بقرية المنزلة.</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                <span>جوائز مالية قيمة وشهادات تقدير معتمدة لجميع المتفوقين في الحفل الختامي.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200">
              <p className="text-xs text-amber-800 font-medium">
                في حال واجهت أي صعوبة في التسجيل، يمكنك التواصل مع إدارة المؤسسة أو زيارة مقرها بالقرية.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
