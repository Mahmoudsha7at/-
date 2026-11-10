/**
 * Server Configuration
 * Al-Tayseer Quran Memorization Competition
 */

import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // Existing Google Workspace Resource IDs (Provided in Master Spec)
  SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || '1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY',
  SHEET_NAME: 'Form Responses 1',
  SHEET_GID: '1038012749',
  DOCS_TEMPLATE_ID: process.env.GOOGLE_DOCS_TEMPLATE_ID || '1dcQv657tIeuXWz2HsAt-fVzoXsJISW0EY13NEWscpj0',
  DRIVE_ROOT_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || '1Z-mBJ639S2j4uj7LRvHfVlZ43YoQ99DY',

  // Apps Script Bridge Web App URL and Secret
  APPS_SCRIPT_URL: process.env.APPS_SCRIPT_URL || '',
  APPS_SCRIPT_SECRET: process.env.APPS_SCRIPT_SECRET || '',

  // Admin Security Configuration
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || 'shahatmahmoud579@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase()),
  ADMIN_KEY: process.env.ADMIN_KEY || 'altayseer_admin_2026',

  // Quran Memorization Levels
  LEVELS: [
    'القرآن كاملاً بالتجويد',
    'القرآن كاملاً',
    'خمسة عشر جزءًا',
    'عشرة أجزاء',
    'خمسة أجزاء',
    'ربع يس'
  ],

  // Default Organization & Competition Details
  DEFAULT_SETTINGS: {
    competitionTitle: 'مسابقة مؤسسة التيسير الخيرية لحفظة القرآن الكريم بقرية المنزلة',
    organizationName: 'مؤسسة التيسير الخيرية',
    villageName: 'قرية المنزلة - محافظة الدقهلية',
    registrationOpen: true,
    registrationDeadline: '2026-12-15',
    competitionStartDate: '2026-12-25',
    contactPhone: '01000000000',
    contactLocation: 'مقر مؤسسة التيسير الخيرية - المسجد الكبير بقرية المنزلة',
    rules: [
      'أن يكون المتسابق من أبناء قرية المنزلة أو القرى المجاورة.',
      'يحق للمتسابق الاشتراك في مستوى واحد فقط في المسابقة.',
      'الالتزام بالحضور في الموعد والمكان المحددين للاختبار النهائي.',
      'إحضار بطاقة التسجيل المطبوعة أو صورة الرقم القومي / شهادة الميلاد عند الاختبار.',
      'قرارات لجنة التحكيم نهائية وغير قابلة للطعن بعد اعتمادها من إدارة المؤسسة.'
    ],
    faq: [
      {
        question: 'كيف يمكنني التأكد من اكتمال تسجيل ابني/ابنتي؟',
        answer: 'بمجرد الضغط على تأكيد التسجيل، ستظهر لك بطاقة المتسابق برقم طلب فريد، وسيتم توليد استمارة PDF الرسمية وإرسال البيانات مباشرة لسجل المسابقة.'
      },
      {
        question: 'هل يمكن تعديل بيانات المتسابق بعد إرسالها؟',
        answer: 'نعم، يمكن التواصل مع إدارة المؤسسة أو عبر مقرها بقرية المنزلة لتعديل أي بيانات عبر لوحة التحكم المركزية.'
      },
      {
        question: 'هل التسجيل مجاني؟',
        answer: 'نعم، التسجيل مجاني تماماً برعاية مؤسسة التيسير الخيرية خدمةً لكتاب الله وأهله.'
      },
      {
        question: 'ما هي جوائز المسابقة؟',
        answer: 'جوائز مالية قيّمة للعشرة الأوائل في كل مستوى، بالإضافة لشهادات تقدير وجوائز تشجيعية لكافة المتميزين.'
      }
    ]
  }
};
