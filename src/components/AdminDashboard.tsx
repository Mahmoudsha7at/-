import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  Edit3, 
  ShieldCheck, 
  Settings, 
  FolderCheck, 
  Layers, 
  Play, 
  Check, 
  X,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  GraduationCap,
  Eye,
  Key,
  Database
} from 'lucide-react';
import { api } from '../services/api.js';
import { ParticipantRecord, DashboardStats, WorkspaceHealth, RegistrationStatus } from '../types.js';

interface AdminDashboardProps {
  onLogout: () => void;
}

const DEFAULT_LEVELS = [
  'القرآن كاملاً بالتجويد',
  'القرآن كاملاً',
  'خمسة عشر جزءًا',
  'عشرة أجزاء',
  'خمسة أجزاء',
  'ربع يس'
];

const WORKSPACE_IDS = {
  SPREADSHEET_ID: '1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY',
  SHEET_NAME: 'Form Responses 1',
  DOCS_TEMPLATE_ID: '1dcQv657tIeuXWz2HsAt-fVzoXsJISW0EY13NEWscpj0',
  DRIVE_ROOT_FOLDER_ID: '1Z-mBJ639S2j4uj7LRvHfVlZ43YoQ99DY'
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'pdf-center' | 'workspace' | 'settings'>('overview');
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [pdfFilter, setPdfFilter] = useState('الكل');

  // Single Participant Modal (for viewing/editing)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ParticipantRecord>>({});
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);

  // PDF Batch Operation State
  const [batchLimit, setBatchLimit] = useState(15);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);

  // Workspace Health State
  const [health, setHealth] = useState<WorkspaceHealth | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Bridge Config State
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [bridgeSecret, setBridgeSecret] = useState('');
  const [bridgeConfig, setBridgeConfig] = useState<any>(null);
  const [isSavingBridge, setIsSavingBridge] = useState(false);
  const [bridgeSaveSuccess, setBridgeSaveSuccess] = useState(false);

  // Settings state
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  // Load Initial Dashboard Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [statsData, listData, healthData, configData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getRegistrations({ page, pageSize: 15, search, level: levelFilter, status: statusFilter, pdfStatus: pdfFilter }),
        api.checkHealth().catch(() => null),
        api.getBridgeConfig().catch(() => null)
      ]);

      if (statsData) setStats(statsData);
      if (listData) {
        setParticipants(listData.items);
        setTotalParticipants(listData.total);
        setTotalPages(listData.totalPages);
      }
      if (healthData) setHealth(healthData);
      if (configData) {
        setBridgeConfig(configData);
        if (configData.url) setBridgeUrl(configData.url);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحميل بيانات الإدارة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [page, levelFilter, statusFilter, pdfFilter]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadDashboardData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Run Workspace Health Check
  const runHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const h = await api.checkHealth();
      setHealth(h);
    } catch (err: any) {
      alert('فشل فحص الاتصال: ' + err.message);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Run PDF Batch Processor
  const runBatchProcessing = async () => {
    setIsProcessingBatch(true);
    setBatchResult(null);
    try {
      const res = await api.batchGeneratePdfs(batchLimit);
      setBatchResult(res);
      await loadDashboardData();
    } catch (err: any) {
      alert('خطأ في تشغيل دفعة PDF: ' + err.message);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Regenerate PDF for single participant
  const handleRegeneratePdf = async (orderNumber: string) => {
    try {
      const res = await api.generatePdf(orderNumber, true);
      alert('تم تحديث وتوليد ملف PDF بنجاح!');
      if (selectedParticipant && selectedParticipant.orderNumber === orderNumber) {
        setSelectedParticipant({
          ...selectedParticipant,
          pdfStatus: 'جاهز',
          fileUrl: res.pdfUrl
        });
      }
      loadDashboardData();
    } catch (err: any) {
      alert('فشل توليد PDF: ' + err.message);
    }
  };

  // Open Participant Detail / Edit
  const openParticipantModal = async (participant: ParticipantRecord) => {
    try {
      const full = await api.getParticipant(participant.orderNumber);
      setSelectedParticipant(full);
      setEditFormData(full);
    } catch {
      setSelectedParticipant(participant);
      setEditFormData(participant);
    }
  };

  // Save Participant Updates
  const handleSaveParticipant = async () => {
    if (!selectedParticipant) return;
    setIsSavingParticipant(true);
    try {
      const updated = await api.updateParticipant(selectedParticipant.orderNumber, editFormData);
      setSelectedParticipant(updated);
      alert('تم حفظ تعديلات المتسابق بنجاح');
      loadDashboardData();
    } catch (err: any) {
      alert('فشل حفظ التعديلات: ' + err.message);
    } finally {
      setIsSavingParticipant(false);
    }
  };

  // Save Bridge Config
  const handleSaveBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBridge(true);
    setBridgeSaveSuccess(false);
    try {
      const updated = await api.updateBridgeConfig(bridgeUrl, bridgeSecret || undefined);
      setBridgeConfig(updated);
      setBridgeSaveSuccess(true);
      await runHealthCheck();
    } catch (err: any) {
      alert('فشل تحديث إعدادات الجسر: ' + err.message);
    } finally {
      setIsSavingBridge(false);
    }
  };

  // Download CSV
  const handleExportCsv = async () => {
    try {
      await api.downloadExportCsv();
    } catch (err: any) {
      alert('فشل تحميل ملف CSV: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مقبول':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'مكتمل':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'قيد المراجعة':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'مرفوض':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'غير مكتمل':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPdfBadge = (pdfStatus: string) => {
    switch (pdfStatus) {
      case 'جاهز':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'قيد المعالجة':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'بحاجة للتحديث':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'فشل':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      
      {/* Top Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black">لوحة التحكم الإدارية المركزية</h1>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    مسؤول معتمد
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  مسابقة مؤسسة التيسير الخيرية بقرية المنزلة — إدارة متصلة بـ Google Workspace
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
                title="تصدير كشف المتسابقين بصيغة Excel/CSV"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تصدير Excel (CSV)</span>
              </button>

              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onLogout}
                className="text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-3.5 py-2.5 rounded-xl border border-rose-500/30 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800 pt-3">
            {[
              { id: 'overview', label: 'نظرة عامة وإحصائيات', icon: Layers },
              { id: 'participants', label: `سجل المتسابقين (${totalParticipants})`, icon: Users },
              { id: 'pdf-center', label: 'مركز استمارات PDF', icon: FileCheck },
              { id: 'workspace', label: 'فحص اتصال Google Workspace', icon: Database },
              { id: 'settings', label: 'إعدادات المسابقة والجسر', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Connection Notice Banner */}
        {health && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            health.isMock 
              ? 'bg-amber-50 border-amber-300 text-amber-900' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                health.isMock ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
              }`}>
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-sm">
                  {health.isMock 
                    ? 'وضع المحاكاة المحلي التفاعلي جاهز' 
                    : 'متصل ومفعل مباشرة مع Google Apps Script Web App'}
                </span>
                <span className="opacity-90">
                  {health.isMock
                    ? 'يمكنك تسجيل وفحص كافة العمليات محلياً، أو إدخال رابط نشر Apps Script في تبويب الإعدادات لربط الشيت المباشر.'
                    : `جدول البيانات: ${WORKSPACE_IDS.SPREADSHEET_ID} | ورقة الاستجابات: ${WORKSPACE_IDS.SHEET_NAME}`}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setActiveTab('workspace')}
              className="font-bold underline shrink-0 hover:opacity-80"
            >
              عرض تشخيص الموارد
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-600">إجمالي المتسابقين</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {stats.totalParticipants}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">مسجل في سجل المسابقة</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-600">تسجيلات اليوم</span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-amber-600 font-mono">
                  {stats.todayRegistrations}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">تاريخ اليوم</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-600">استمارات PDF الجاهزة</span>
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  {stats.readyPdfs}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">محفوظة في Google Drive</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold text-slate-600">الملفات الناقصة / قيد الانتظار</span>
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-3xl font-black text-rose-600 font-mono">
                  {stats.missingPdfs}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">تحتاج لتوليد أو معالجة</p>
              </div>

            </div>

            {/* Level Distribution Chart Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Level Counts */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FolderCheck className="w-5 h-5 text-amber-600" />
                  <span>توزيع المتسابقين حسب مستويات الحفظ (المجلدات)</span>
                </h3>

                <div className="space-y-3.5">
                  {Object.entries(stats.levelCounts).map(([lvlName, count]) => {
                    const percentage = stats.totalParticipants > 0 
                      ? Math.round((count / stats.totalParticipants) * 100) 
                      : 0;

                    return (
                      <div key={lvlName} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">{lvlName}</span>
                          <span className="text-slate-600 font-mono">
                            {count} متسابق ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>حالات الطلبات</span>
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.statusCounts).map(([stName, stCount]) => (
                      <div key={stName} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs font-bold">
                        <span className={`px-2.5 py-0.5 rounded-full border ${getStatusBadge(stName)}`}>
                          {stName}
                        </span>
                        <span className="font-mono text-slate-900 text-sm">{stCount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => setActiveTab('pdf-center')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors text-center"
                  >
                    الانتقال لمعالجة الملفات في مركز PDF
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PARTICIPANTS MANAGEMENT */}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-200">
            
            {/* Filter & Search Bar */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم، رقم الموبايل، رقم الطلب، أو المحفظ..."
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setLevelFilter('الكل');
                    setStatusFilter('الكل');
                    setPdfFilter('الكل');
                    setSearch('');
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>

              {/* Filter Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">المستوى:</label>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="الكل">جميع المستويات</option>
                    {DEFAULT_LEVELS.map((l: string) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">حالة الطلب:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="الكل">جميع الحالات</option>
                    <option value="جديد">جديد</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="مقبول">مقبول</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="غير مكتمل">غير مكتمل</option>
                    <option value="مرفوض">مرفوض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">حالة PDF:</label>
                  <select
                    value={pdfFilter}
                    onChange={(e) => setPdfFilter(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="الكل">كافة الحالات</option>
                    <option value="جاهز">جاهز</option>
                    <option value="قيد المعالجة">قيد المعالجة</option>
                    <option value="بحاجة للتحديث">بحاجة للتحديث</option>
                    <option value="فشل">فشل</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">رقم الطلب</th>
                    <th className="p-3.5">الرقم بالمسار</th>
                    <th className="p-3.5">اسم المتسابق</th>
                    <th className="p-3.5">المستوى</th>
                    <th className="p-3.5">الموبايل</th>
                    <th className="p-3.5">المحفظ</th>
                    <th className="p-3.5">السن</th>
                    <th className="p-3.5">حالة الطلب</th>
                    <th className="p-3.5">ملف PDF</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 font-bold text-sm">
                        لا توجد نتائج تطابق معايير البحث
                      </td>
                    </tr>
                  ) : (
                    participants.map((p) => (
                      <tr key={p.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{p.orderNumber}</td>
                        <td className="p-3.5 font-mono text-amber-700 font-bold">{p.contestantNumber || '—'}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.fullName}</td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            {p.level}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600" dir="ltr">{p.phone}</td>
                        <td className="p-3.5 text-slate-700">{p.teacher}</td>
                        <td className="p-3.5 text-slate-600">{p.age}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {p.fileUrl ? (
                            <a
                              href={p.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100"
                            >
                              <span>عرض PDF</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getPdfBadge(p.pdfStatus)}`}>
                              {p.pdfStatus}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => openParticipantModal(p)}
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>تفاصيل / تعديل</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
              <div>
                إجمالي النتائج: <span className="font-bold text-slate-900">{totalParticipants}</span> متسابق
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span>صفحة {page} من {totalPages || 1}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PDF OPERATIONS CENTER */}
        {activeTab === 'pdf-center' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Batch Processing Controller */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-500" />
                    <span>مركز معالجة واستخراج استمارات PDF المعتمدة</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    يعتمد على قالب Google Docs رقم <span className="font-mono">{WORKSPACE_IDS.DOCS_TEMPLATE_ID}</span> ويحفظ الملفات في مجلدات المستويات.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>حجم الدفعة:</span>
                    <select
                      value={batchLimit}
                      onChange={(e) => setBatchLimit(parseInt(e.target.value, 10))}
                      className="p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                    >
                      <option value="5">5 ملفات</option>
                      <option value="10">10 ملفات</option>
                      <option value="15">15 ملفاً (مستحسن)</option>
                      <option value="25">25 ملفاً</option>
                    </select>
                  </div>

                  <button
                    onClick={runBatchProcessing}
                    disabled={isProcessingBatch}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{isProcessingBatch ? 'جارٍ معالجة الدفعة...' : 'تشغيل معالجة الملفات الناقصة'}</span>
                  </button>
                </div>
              </div>

              {/* Progress and status */}
              {batchResult && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">نتيجة تشغيل الدفعة الأخيرة:</span>
                    <span className="text-emerald-700">تم بنجاح {batchResult.successes} من {batchResult.processed}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>المعالجة: {batchResult.processed}</span>
                    <span>الناجحة: {batchResult.successes}</span>
                    <span>المتبقي في الطابور: {batchResult.remaining} ملف</span>
                  </div>
                </div>
              )}

              {/* Guidelines Box */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-2">
                <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>آلية التوليد والتسمية المعتمدة:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 pr-1 text-slate-700">
                  <li>صيغة التسمية الرسمية: <span className="font-mono font-bold">001 - اسم المتسابق - رقم الطلب.pdf</span></li>
                  <li>يتم الحفظ تلقائياً في المجلد الفرعي الخاص بكل مستوى داخل المجلد الرئيسي.</li>
                  <li>يتم تحديث رابط الملف في Google Sheets في العمود (I) فور التحقق من صحة الملف.</li>
                  <li>تتم المعالجة بنظام الدفعات الصغيرة الآمنة لتجنب تجاوز حدود وقت تنفيذ السحابة (Timeout).</li>
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: GOOGLE WORKSPACE DIAGNOSTIC CENTER */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <span>تشخيص وفحص اتصال Google Workspace الأصلي</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    فحص الاتصال الفردي بالموارد الحالية الثلاثة المحددة مسبقاً.
                  </p>
                </div>

                <button
                  onClick={runHealthCheck}
                  disabled={isCheckingHealth}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                  <span>فحص الاتصال الآن</span>
                </button>
              </div>

              {health && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Spreadsheet Card */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800">1. Google Sheets</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      {health.spreadsheet.title || 'جدول المسابقة الأصلي'}
                    </h4>
                    <p className="text-xs font-mono text-slate-600 mb-2 truncate">
                      ID: {WORKSPACE_IDS.SPREADSHEET_ID}
                    </p>
                    <p className="text-xs text-emerald-800 font-medium">{health.spreadsheet.message}</p>
                    <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
                      ورقة الاستجابات: <span className="font-bold text-slate-900">{WORKSPACE_IDS.SHEET_NAME}</span>
                    </div>
                  </div>

                  {/* Docs Template Card */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800">2. Google Docs</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      {health.docsTemplate.name || 'قالب استمارة المسابقة'}
                    </h4>
                    <p className="text-xs font-mono text-slate-600 mb-2 truncate">
                      ID: {WORKSPACE_IDS.DOCS_TEMPLATE_ID}
                    </p>
                    <p className="text-xs text-emerald-800 font-medium">{health.docsTemplate.message}</p>
                    <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
                      الحقول المستبدلة: <span className="font-bold text-slate-900">7 حقول (name, phone, level...)</span>
                    </div>
                  </div>

                  {/* Drive Root Folder Card */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800">3. Google Drive</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">
                      {health.driveRootFolder.name || 'المجلد الرئيسي للمسابقة'}
                    </h4>
                    <p className="text-xs font-mono text-slate-600 mb-2 truncate">
                      ID: {WORKSPACE_IDS.DRIVE_ROOT_FOLDER_ID}
                    </p>
                    <p className="text-xs text-emerald-800 font-medium">{health.driveRootFolder.message}</p>
                    <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
                      المجلدات الفرعية: <span className="font-bold text-slate-900">6 مجلدات لمستويات الحفظ</span>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 5: SETTINGS & APPS SCRIPT BRIDGE */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Apps Script Bridge Configuration */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">ربط جسر Google Apps Script المباشر</h3>
                  <p className="text-xs text-slate-500">
                    عند نشر <span className="font-mono">apps-script/Code.gs</span> كتطبيق ويب، الصق رابطه هنا للتحويل الفوري من وضع المحاكاة إلى العمل السحابي المباشر.
                  </p>
                </div>
              </div>

              {bridgeSaveSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ وتفعيل إعدادات الجسر بنجاح!</span>
                </div>
              )}

              <form onSubmit={handleSaveBridge} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رابط تطبيق الويب (Apps Script Web App URL)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={bridgeUrl}
                    onChange={(e) => setBridgeUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    راجع دليل النشر المفصل في ملف <span className="font-mono text-slate-600">apps-script/SETUP_AR.md</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز الأمان السري المشترك (APPS_SCRIPT_SECRET)
                  </label>
                  <input
                    type="password"
                    value={bridgeSecret}
                    onChange={(e) => setBridgeSecret(e.target.value)}
                    placeholder="الرمز الذي تم تعيينه في Script Properties لمنع الوصول غير المصرح"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingBridge}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSavingBridge ? 'جارٍ الحفظ والتحقق...' : 'حفظ واختبار الاتصال بالجسر'}
                  </button>
                </div>
              </form>
            </div>

            {/* Registration State Toggle */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">حالة فتح باب التسجيل العام في المسابقة</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  التحكم في إمكانية استقبال استمارات جديدة عبر الموقع من قبل الزوار وأولياء الأمور.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isRegistrationOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {isRegistrationOpen ? 'باب التسجيل مفتوح' : 'باب التسجيل مغلق حالياً'}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* PARTICIPANT DETAIL / EDIT MODAL */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>بيانات المتسابق: {selectedParticipant.fullName}</span>
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  {selectedParticipant.orderNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الاسم رباعي:</label>
                  <input
                    type="text"
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رقم الموبايل:</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اسم المحفظ:</label>
                  <input
                    type="text"
                    value={editFormData.teacher || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, teacher: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">المستوى:</label>
                  <select
                    value={editFormData.level || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                  >
                    {DEFAULT_LEVELS.map((lvl: string) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الرقم القومي (14 رقماً كاملة):</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editFormData.nationalId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nationalId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 text-right font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ الميلاد:</label>
                  <input
                    type="date"
                    value={editFormData.birthDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">حالة التسجيل:</label>
                  <select
                    value={editFormData.status || 'جديد'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                  >
                    <option value="جديد">جديد</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="مقبول">مقبول</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="غير مكتمل">غير مكتمل</option>
                    <option value="مرفوض">مرفوض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">حالة PDF الحالية:</label>
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`px-2.5 py-1 rounded-md border font-bold text-xs ${getPdfBadge(selectedParticipant.pdfStatus)}`}>
                      {selectedParticipant.pdfStatus}
                    </span>
                    {selectedParticipant.fileUrl && (
                      <a
                        href={selectedParticipant.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <span>فتح في Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات الإدارة:</label>
                <textarea
                  rows={2}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="تدوين ملاحظات المشرفين ولجنة التحكيم..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleRegeneratePdf(selectedParticipant.orderNumber)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة توليد استمارة PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedParticipant(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={handleSaveParticipant}
                  disabled={isSavingParticipant}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
                >
                  {isSavingParticipant ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
