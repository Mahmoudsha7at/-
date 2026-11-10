import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, X, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('shahatmahmoud579@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await api.adminLogin(email.trim(), password.trim() || undefined);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة أو الحساب غير مصرح له كمسؤول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">تسجيل دخول مسؤولي المسابقة</h3>
          <p className="text-xs text-slate-300 mt-1">
            لوحة الإدارة والتحكم لمؤسسة التيسير الخيرية
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              البريد الإلكتروني للمسؤول (المدرج بالقائمة البيضاء)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shahatmahmoud579@gmail.com"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 text-right"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              البريد الافتراضي المعتمد: <span className="font-mono text-slate-600">shahatmahmoud579@gmail.com</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              مفتاح المرور الإداري (أو كلمة سر الإدارة)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل مفتاح المرور للمشرف"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحقق والمصادقة...</span>
                </>
              ) : (
                <span>دخول لوحة التحكم</span>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-2 border-t border-slate-100">
            هذه المنطقة مخصصة حصراً للجنة المنظمة ولن يتمكن الزوار من رؤية بيانات المتسابقين أو أرقامهم القومية.
          </p>

        </form>

      </div>
    </div>
  );
};
