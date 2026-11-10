import React from 'react';
import { MapPin, Phone, Clock, Mail, Building, HeartHandshake } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>نحن في خدمتكم</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            تواصل مع إدارة مؤسسة التيسير الخيرية
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600">
            يسعدنا استقبال استفساراتكم وملاحظاتكم طوال فترة التسجيل وحتى موعد الحفل الختامي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">مقر المؤسسة</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              بجوار المسجد الكبير - قرية المنزلة
              <br />
              مركز طوخ / محافظة القليوبية
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">أوقات العمل والمراجعة</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              يومياً من بعد صلاة العصر وحتى العشاء
              <br />
              خلال فترة التسجيل الرسمية
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">لجنة المسابقات والتحكيم</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              إشراف نخبة من مشايخ وقراء القرية
              <br />
              معتمدون من الأزهر الشريف والأوقاف
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
