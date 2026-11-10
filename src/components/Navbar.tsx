import React, { useState } from 'react';
import { BookOpen, Award, Menu, X, ShieldCheck, UserCheck, LogOut, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdminLoggedIn,
  onOpenLoginModal,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'levels', label: 'مستويات المسابقة' },
    { id: 'rules', label: 'الشروط والتعليمات' },
    { id: 'faq', label: 'الأسئلة الشائعة' },
    { id: 'contact', label: 'تواصل معنا' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro banner */}
      <div className="bg-slate-900 text-amber-300 text-xs py-1.5 px-4 text-center font-medium border-b border-amber-500/20">
        <span className="inline-flex items-center gap-2">
          <span>✨ مسابقة مؤسسة التيسير الخيرية لحفظة القرآن الكريم بقرية المنزلة — باب التسجيل مفتوح لعام 2026</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  مؤسسة التيسير الخيرية
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300/60 hidden sm:inline-block">
                  المنزلة
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                مسابقة حفظ القرآن الكريم وتجويده
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  const el = document.getElementById(link.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentTab === link.id
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* New Registration Button */}
            <button
              onClick={() => {
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/25 hover:shadow-lg transition-all active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>تسجيل متسابق جديد</span>
            </button>

            {/* Admin Dashboard or Login */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all border ${
                    currentTab === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>لوحة الإدارة</span>
                </button>
                <button
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>دخول الإدارة</span>
              </button>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => {
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-amber-500 text-white p-2 rounded-lg text-xs font-bold"
            >
              تسجيل
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentTab(link.id);
                setMobileMenuOpen(false);
                const el = document.getElementById(link.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-right px-4 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setCurrentTab('register');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2.5 rounded-xl shadow-xs"
            >
              <Award className="w-4 h-4" />
              <span>تسجيل متسابق جديد</span>
            </button>
            {isAdminLoggedIn ? (
              <button
                onClick={() => {
                  setCurrentTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-2.5 rounded-xl"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>لوحة التحكم الإدارية</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                دخول المسؤولين (Admin Login)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
