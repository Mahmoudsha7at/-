# دليل إعداد ونشر جسر Google Apps Script لمسابقة التيسير

هذا الدليل يوضح للإدارة والمشرفين كيفية تفعيل ونشر كود التكامل `apps-script/Code.gs` لربط الموقع مباشرة مع:
1. **Google Sheets** (جدول بيانات الاستجابات الأصلي)
2. **Google Docs** (قالب استمارة المتسابق)
3. **Google Drive** (المجلد الرئيسي لتنظيم ملفات PDF حسب المستويات)

---

## 1. الموارد المستخدمة حالياً في المسابقة

| المورد | المُعرّف (ID) | الرابط المباشر |
|---|---|---|
| **Google Sheets** | `1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY` | [رابط الشيت](https://docs.google.com/spreadsheets/d/1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY/edit) |
| **ورقة الاستجابات** | `Form Responses 1` (GID: `1038012749`) | تبويب الاستجابات الافتراضي |
| **قالب Google Docs** | `1dcQv657tIeuXWz2HsAt-fVzoXsJISW0EY13NEWscpj0` | [رابط المستند](https://docs.google.com/document/d/1dcQv657tIeuXWz2HsAt-fVzoXsJISW0EY13NEWscpj0/edit) |
| **مجلد Google Drive** | `1Z-mBJ639S2j4uj7LRvHfVlZ43YoQ99DY` | [رابط المجلد](https://drive.google.com/drive/folders/1Z-mBJ639S2j4uj7LRvHfVlZ43YoQ99DY) |

---

## 2. خطوات التثبيت في حساب Google (خطوة بخطوة)

### الخطوة 1: فتح محرر التطبيقات (Apps Script)
1. افتح جدول بيانات المسابقة [Google Sheets](https://docs.google.com/spreadsheets/d/1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY/edit).
2. من القائمة العلوية اضغط على **الإضافات (Extensions)** ثم اختر **Apps Script**.
3. أو يمكنك الدخول مباشرة على [script.google.com](https://script.google.com) وإنشاء مشروع جديد باسم:
   `Al-Tayseer Quran Bridge`

### الخطوة 2: نسخ الكود البرمجي
1. احذف أي كود افتراضي موجود في ملف `Code.gs`.
2. انسخ محتويات الملف `apps-script/Code.gs` كاملة والصقها هناك.
3. اضغط على أيقونة **الحفظ (Save)** (أو `Ctrl + S`).

### الخطوة 3: تعيين مفتاح الأمان السري (Script Properties)
لحماية الجسر البرمجي والتأكد من أن الاستدعاءات تأتي حصراً من موقع المسابقة:
1. من القائمة الجانبية في Apps Script، اضغط على **إعدادات المشروع (Project Settings)** (رمز الترس ⚙️).
2. انزل إلى قسم **خصائص النص البرمجي (Script Properties)** واضغط **إضافة خاصية (Add script property)**:
   - **الخاصية (Property):** `APPS_SCRIPT_SECRET`
   - **القيمة (Value):** ضع كلمة سر قوية (مثل: `altayseer_secure_token_2026_xyz`)
3. احفظ القيمة، وتأكد من كتابة نفس القيمة في إعدادات بيئة الموقع (متغير `APPS_SCRIPT_SECRET`).

### الخطوة 4: النشر كتطبيق ويب (Deploy as Web App)
1. في أعلى يسار الشاشة، اضغط على زر **نشر (Deploy)** الأزرق ➔ **نشر جديد (New deployment)**.
2. اضغط على رمز الترس بجوار نوع النشر واختر **تطبيق ويب (Web app)**.
3. اضبط الإعدادات التالية بدقة:
   - **الوصف (Description):** `Al-Tayseer Quran Competition Production v2`
   - **تنفيذ باسم (Execute as):** **أنا (حسابي - me@...)** *(ضروري جداً لكي يتمكن الزوار من التسجيل في مجلداتك دون الحاجة لدخول حساباتهم)*.
   - **من يمكنه الوصول (Who has access):** **أي شخص (Anyone)** *(المفتاح السري هو الذي يمنع الاستخدام العشوائي ويحميه)*.
4. اضغط **نشر (Deploy)**.

### الخطوة 5: منح الأذونات (Authorization)
1. ستظهر لك نافذة تطلب منح الصلاحيات للوصول إلى Google Drive و Google Docs و Google Sheets.
2. اضغط على **Authorize access** واختر حسابك.
3. إذا ظهرت رسالة تحذير "Google hasn't verified this app"، اضغط على **Advanced (خيارات متقدمة)** في الأسفل، ثم اضغط على **Go to Al-Tayseer Quran Bridge (unsafe)**.
4. اضغط **Allow (سماح)**.

### الخطوة 6: نسخ رابط تطبيق الويب
1. انسخ الرابط الذي ينتهي بـ `/exec` (يبدأ بـ `https://script.google.com/macros/s/.../exec`).
2. ضعه في متغير البيئة `APPS_SCRIPT_URL` في إعدادات الموقع أو في لوحة تحكم مدير النظام.

---

## 3. التحقق واختبار الصحة

يمكنك اختبار الاتصال المباشر بإحدى طريقتين:
1. **من محرر Apps Script:** اختر الدالة `testHealthManual` من القائمة واضغط **تشغيل (Run)**.
   يجب أن يظهر في سجل التنفيذ (Execution log):
   ```json
   {
     "spreadsheet": { "ok": true, "message": "تم الاتصال بجدول البيانات بنجاح" },
     "sheetTab": { "ok": true, "rowCount": ... },
     "docsTemplate": { "ok": true },
     "driveRootFolder": { "ok": true },
     "allOk": true
   }
   ```
2. **من لوحة تحكم موقع المسابقة:** افتح تبويب **فحص اتصال Google Workspace** واضغط **فحص فوري الآن**.

---

## 4. الميزات المدمجة وحل المشاكل السابقة

1. **عدم الاعتماد على الشيت النشط:** تم استخدام المعرف الصريح `1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY`.
2. **منع الأخطاء المتزامنة:** تم تطبيق `LockService` لمنع تداخل أرقام الطلبات عند تسجيل أكثر من شخص في نفس اللحظة.
3. **توليد أرقام متسابقين مستقلة لكل مستوى:** يُعطى كل متسابق رقماً تسلسلياً داخل مستواه (مثل 001، 002...).
4. **تسمية الملفات المنظمة:** `001 - اسم المتسابق - رقم الطلب.pdf`.
5. **إنشاء مجلد تلقائي لكل مستوى:** ينشئ الجسر مجلدات تلقائياً داخل المجلد الرئيسي لكل مستوى حفظ ويعيد استخدامها.
6. **معالجة الدفعات بأمان:** في حال تشغيل معالجة الملفات الناقصة، تفشل حالة واحدة فقط دون توقف باقي الدفعة.
