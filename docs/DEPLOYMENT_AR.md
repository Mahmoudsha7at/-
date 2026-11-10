# دليل نشر وتشغيل مسابقة مؤسسة التيسير الخيرية
## Deployment Guide — Al-Tayseer Quran Competition Platform

---

## 1. النشر عبر Google AI Studio (Cloud Run)

تم بناء المنصة بالكامل كحزمة تطبيق متكامل (Full-Stack React + Node.js Express) متوافق مع معايير النشر التلقائي عبر Google Cloud Run المتاح في استوديو الذكاء الاصطناعي (Google AI Studio Publish):

### أمر البناء والتشغيل:
- **أمر البناء:** `npm run build`
- **أمر التشغيل:** `npm start` (يطلق الخادم المدمج `server.ts` عبر `tsx server.ts` على المنفذ `3000`).

---

## 2. متغيرات البيئة (Environment Variables)

عند النشر في الإنتاج، تأكد من ضبط المتغيرات التالية في لوحة أسرار وبيئة العمل (Secrets / Environment Panel):

```env
# 1. روابط وهوية المسابقة وموارد Google Workspace
GOOGLE_SPREADSHEET_ID=1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY
GOOGLE_DOCS_TEMPLATE_ID=1dcQv657tIeuXWz2HsAt-fVzoXsJISW0EY13NEWscpj0
GOOGLE_DRIVE_FOLDER_ID=1Z-mBJ639S2j4uj7LRvHfVlZ43YoQ99DY

# 2. جسر Google Apps Script
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
APPS_SCRIPT_SECRET=altayseer_secure_token_2026_xyz

# 3. قائمة مسؤولي النظام المصرح لهم
ADMIN_EMAILS=shahatmahmoud579@gmail.com
ADMIN_KEY=altayseer_admin_2026
```

---

## 3. نشر وتفعيل Google Apps Script Bridge

1. افتح شيت المسابقة `1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY`.
2. ادخل على **Extensions ➔ Apps Script**.
3. الصق محتويات الملف `apps-script/Code.gs`.
4. اضغط **Deploy ➔ New Deployment ➔ Web App**:
   - **Execute as:** `Me (مالك الحساب)`
   - **Who has access:** `Anyone`
5. اضغط على **Deploy** وامنح الصلاحيات المطلوبة.
6. انسخ رابط الويب `/exec` وضعه في إعدادات الموقع أو داخل لوحة تحكم المشرف (تبويب إعدادات الجسر).

---

## 4. التحقق بعد النشر

- الدخول على الصفحة الرئيسية والتأكد من ظهور شعار وعنوان المسابقة.
- تجربة تسجيل استمارة متسابق والتأكد من صدور رقم الطلب (مثال: `QRC-2026-00001`).
- التحقق من ظهور المتسابق في لوحة التحكم الإدارية.
- تجربة الضغط على "طباعة بطاقة المتسابق" من شاشة النجاح.
