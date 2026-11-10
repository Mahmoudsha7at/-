import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'كيف أتأكد أن تسجيلي أو تسجيل ابني تم بنجاح؟',
      a: 'بمجرد الضغط على تأكيد التسجيل، تظهر لك بطاقة المتسابق متضمنة رقم الطلب الفريد (مثال: QRC-2026-00001) ورقم المتسابق داخل مستواه. كما يتم إرسال البيانات مباشرة لجدول Google Sheets الرسمي وتوليد استمارة PDF في Google Drive.'
    },
    {
      q: 'هل يمكن تعديل بيانات المتسابق بعد الانتهاء من التسجيل؟',
      a: 'نعم، يمكن للمتسابق أو ولي أمره مراجعة إدارة مؤسسة التيسير الخيرية بمقرها بقرية المنزلة برقم الطلب لتعديل أي بيانات عبر لوحة التحكم المركزية.'
    },
    {
      q: 'ما هو المستند المطلوب إحضاره يوم الاختبار؟',
      a: 'يجب إحضار بطاقة المتسابق المطبوعة من الموقع الإلكتروني أو تدوين رقم الطلب، بالإضافة إلى شهادة الميلاد الأصلية المميكنة أو بطاقة الرقم القومي للمطابقة.'
    },
    {
      q: 'هل يمكن للمتسابق الاشتراك في أكثر من مستوى؟',
      a: 'وفقاً للائحة المسابقة، لا يحق للمتسابق الاشتراك إلا في مستوى واحد فقط في الدورة نفسها لإتاحة الفرصة لأكبر عدد من المشاركين.'
    },
    {
      q: 'هل هناك رسوم للاشتراك في المسابقة؟',
      a: 'لا توجد أي رسوم إطلاقاً؛ المسابقة مجانية بالكامل ومقدمة كخدمة خيرية لأهل القرآن برعاية مؤسسة التيسير الخيرية بقرية المنزلة.'
    },
    {
      q: 'ماذا أفعل إذا ظهرت رسالة تفيد بأن الرقم القومي مسجل بالفعل؟',
      a: 'النظام يمنع التكرار التلقائي لحماية المتسابقين. إذا كنت قد سجلت مسبقاً، يمكنك استخدام رقم طلبك للاستعلام أو مراجعة إدارة المؤسسة في حال وجود خطأ في البيانات.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>إجابات وافية</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            الأسئلة الشائعة حول المسابقة
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            جمعنا لكم أهم الاستفسارات المتكررة حول شروط وآلية التسجيل ومواعيد الاختبارات.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-right font-bold text-base sm:text-lg text-slate-900 hover:text-amber-700 transition-colors focus:outline-none"
                >
                  <span className="flex-1 pl-4">{faq.q}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
