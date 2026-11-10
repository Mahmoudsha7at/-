import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { LevelsSection } from './components/LevelsSection.js';
import { RulesSection } from './components/RulesSection.js';
import { FaqSection } from './components/FaqSection.js';
import { ContactSection } from './components/ContactSection.js';
import { Footer } from './components/Footer.js';
import { RegistrationForm } from './components/RegistrationForm.js';
import { SuccessCard } from './components/SuccessCard.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { AdminLoginModal } from './components/AdminLoginModal.js';
import { api } from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'levels' | 'rules' | 'faq' | 'contact' | 'register' | 'success' | 'admin'>('home');
  const [selectedLevel, setSelectedLevel] = useState<string>('القرآن كاملاً بالتجويد');
  const [successData, setSuccessData] = useState<any>(null);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check persisted admin session on load
  useEffect(() => {
    const auth = api.getAdminAuth();
    if (auth.isAuthenticated) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegistrationSuccess = (data: any) => {
    setSuccessData(data);
    setCurrentTab('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLookupOrder = async (orderNumber: string) => {
    try {
      const data = await api.lookupRegistration(orderNumber);
      setSuccessData({
        orderNumber: data.orderNumber,
        contestantNumber: data.contestantNumber,
        fullName: data.fullName,
        level: data.level,
        pdfStatus: data.pdfStatus,
        pdfUrl: data.pdfUrl,
        timestamp: data.timestamp,
        phone: 'محمي للخصوصية',
        teacher: 'مسجل في السجل',
        age: 'معتمد'
      });
      setCurrentTab('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'لم يتم العثور على طلب بهذا الرقم. تأكد من صحة رقم الطلب.');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentTab('admin');
  };

  const handleAdminLogout = () => {
    api.clearAdminAuth();
    setIsAdminLoggedIn(false);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-950">
      
      {/* Sticky Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'admin' && !isAdminLoggedIn) {
            setIsLoginModalOpen(true);
          } else {
            setCurrentTab(tab as any);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: REGISTRATION FORM */}
        {currentTab === 'register' && (
          <RegistrationForm
            initialLevel={selectedLevel}
            onSuccess={handleRegistrationSuccess}
            onCancel={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 2: REGISTRATION SUCCESS RECEIPT */}
        {currentTab === 'success' && successData && (
          <SuccessCard
            data={successData}
            onNewRegistration={() => {
              setSuccessData(null);
              setCurrentTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoHome={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {currentTab === 'admin' && isAdminLoggedIn && (
          <AdminDashboard onLogout={handleAdminLogout} />
        )}

        {/* VIEW 4: HOMEPAGE (And section anchors) */}
        {(currentTab === 'home' || currentTab === 'levels' || currentTab === 'rules' || currentTab === 'faq' || currentTab === 'contact') && (
          <>
            <Hero
              onStartRegistration={() => {
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewLevels={() => {
                const el = document.getElementById('levels');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onLookupOrder={handleLookupOrder}
            />

            <LevelsSection onSelectLevel={handleSelectLevel} />
            <RulesSection />
            <FaqSection />
            <ContactSection />
          </>
        )}

      </main>

      {/* Respectful Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab as any);
          const el = document.getElementById(tab);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

    </div>
  );
}
