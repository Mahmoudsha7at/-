import React from 'react';
import { BookOpen, Heart, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenLoginModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLoginModal }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg text-white">
                مؤسسة التيسير الخيرية بقرية المنزلة
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              مسابقة سنوية لتشجيع حفظة كتاب الله تعالى وإتقان تلاوته وتجويده بين ناشئة وشباب قرية المنزلة والقرى المجاورة، ابتغاء مرضاة الله تعالى وخدمةً لأهل القرآن.
            </p>
            <p className="font-quran text-amber-300 text-base">
              ﴿ خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ ﴾
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3.5">روابط سريعة</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition-colors">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('levels')} className="hover:text-amber-400 transition-colors">
                  مستويات الحفظ (6 مستويات)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rules')} className="hover:text-amber-400 transition-colors">
                  الشروط والتعليمات
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-amber-400 transition-colors">
                  تسجيل متسابق جديد
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-amber-400 transition-colors">
                  الأسئلة الشائعة
                </button>
              </li>
            </ul>
          </div>

          {/* Administrative & Technical */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3.5">بوابة المشرفين</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              منطقة خاصة بلجان التحكيم وإدارة المؤسسة لمتابعة المتسابقين وطباعة الكشوفات.
            </p>
            <button
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>دخول لوحة التحكم الإدارية</span>
            </button>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} لمؤسسة التيسير الخيرية بقرية المنزلة.
          </p>
          <div className="flex items-center gap-1">
            <span>تم التطوير لخدمة حفظة القرآن الكريم</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
