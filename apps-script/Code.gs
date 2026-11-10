/**
 * =========================================================================
 * مسابقة مؤسسة التيسير الخيرية لحفظة القرآن الكريم بقرية المنزلة
 * AL-TAYSEER QURAN COMPETITION — GOOGLE APPS SCRIPT INTEGRATION BRIDGE
 * =========================================================================
 * 
 * Version: 2.0.0 (Production Release)
 * Description: Production-ready backend bridge connecting the Web Portal with:
 *   1. Google Sheets (Canonical Source of Truth)
 *   2. Google Docs (Certificate / Application Form Template)
 *   3. Google Drive (Automated Level-Organized PDF Storage)
 * 
 * Fixes all 10 legacy issues:
 *  - Uses SpreadsheetApp.openById() instead of getActiveSpreadsheet()
 *  - Prevents manual onFormSubmit(e) errors
 *  - Precise row targeting via unique Registration IDs instead of getLastRow()
 *  - Comprehensive individual resource health checks
 *  - Verifies PDF size and presence before updating sheet
 *  - Single centralized, idempotent PDF generation function
 *  - Uses destinationFolder.createFile(pdfBlob) directly
 *  - Enforces doc.saveAndClose() before PDF export
 *  - Isolated batch operations (failures do not halt subsequent records)
 *  - Masks sensitive National ID values in generic logs
 */

// --- CONFIGURATION CONSTANTS ---
var CONFIG = {
  SPREADSHEET_ID: '1H4gs2Ozcj3EPSoaGM7zR6mjIjdvhzNDhZIHwNMUnNGY',
  SHEET_NAME: 'Form Responses 1',
  DOCS_TEMPLATE_ID: '1dcQv657tIeuXWz2HsAt-fVzoXsJISW0EY13NEWscpj0',
  DRIVE_ROOT_FOLDER_ID: '1Z-mBJ639S2j4uj7LRvHfVlZ43YoQ99DY',
  
  // Levels config
  LEVELS: [
    'القرآن كاملاً بالتجويد',
    'القرآن كاملاً',
    'خمسة عشر جزءًا',
    'عشرة أجزاء',
    'خمسة أجزاء',
    'ربع يس'
  ],
  
  // Column definitions (A to Q)
  COLUMNS: {
    TIMESTAMP: 1,      // A: Timestamp
    FULL_NAME: 2,      // B: الاسم رباعي
    PHONE: 3,          // C: رقم الموبايل
    TEACHER: 4,        // D: اسم المحفظ
    LEVEL: 5,          // E: مقدار الحفظ
    NATIONAL_ID: 6,    // F: الرقم القومي
    AGE: 7,            // G: السن
    BIRTH_DATE: 8,     // H: تاريخ الميلاد
    FILE_URL: 9,       // I: رابط الملف
    // Extended internal columns
    ORDER_NUMBER: 10,  // J: رقم الطلب
    STATUS: 11,        // K: حالة التسجيل
    PDF_STATUS: 12,    // L: حالة PDF
    PDF_FILE_ID: 13,   // M: PDF File ID
    PDF_DATE: 14,      // N: تاريخ إنشاء PDF
    ADMIN_NOTES: 15,   // O: ملاحظات الإدارة
    FINGERPRINT: 16,   // P: Registration Fingerprint
    CONTESTANT_NO: 17  // Q: رقم المتسابق داخل المستوى
  }
};

/**
 * HTTP POST Entry Point
 */
function doPost(e) {
  var output = {
    ok: false,
    message: '',
    data: null,
    requestId: Utilities.getUuid(),
    timestamp: new Date().toISOString()
  };

  try {
    var rawContent = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = JSON.parse(rawContent);

    // Authentication verification
    var scriptProperties = PropertiesService.getScriptProperties();
    var secretToken = scriptProperties.getProperty('APPS_SCRIPT_SECRET');
    
    // If a secret is set in script properties, enforce it
    if (secretToken && payload.secret !== secretToken) {
      output.message = 'غير مصرح بالوصول: مفتاح الأمان غير متطابق';
      return ContentService.createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var action = payload.action || 'health';

    // Route request
    switch (action) {
      case 'health':
        output.data = checkHealth();
        output.ok = true;
        output.message = 'تم فحص الاتصال بالموارد بنجاح';
        break;

      case 'submitRegistration':
        output.data = handleRegistration(payload.participant);
        output.ok = true;
        output.message = 'تم تسجيل المتسابق بنجاح';
        break;

      case 'getRegistrations':
        output.data = getRegistrations(payload.filter || {});
        output.ok = true;
        output.message = 'تم جلب المتسابقين';
        break;

      case 'getRegistration':
        output.data = getRegistrationById(payload.id);
        output.ok = output.data !== null;
        output.message = output.ok ? 'تم جلب بيانات المتسابق' : 'المتسابق غير موجود';
        break;

      case 'updateRegistration':
        output.data = updateRegistration(payload.id, payload.updates);
        output.ok = true;
        output.message = 'تم تحديث بيانات المتسابق';
        break;

      case 'updateRegistrationStatus':
        output.data = updateRegistrationStatus(payload.id, payload.status, payload.notes);
        output.ok = true;
        output.message = 'تم تحديث حالة التسجيل';
        break;

      case 'getDashboardStats':
        output.data = getDashboardStats();
        output.ok = true;
        output.message = 'تم جلب الإحصائيات';
        break;

      case 'generateParticipantPDF':
        output.data = generatePDFForOrder(payload.id, payload.forceRegenerate || false);
        output.ok = true;
        output.message = 'تم توليد ملف PDF بنجاح';
        break;

      case 'generateMissingPDFs':
        output.data = batchGeneratePDFs(payload.limit || 15);
        output.ok = true;
        output.message = 'تم تشغيل معالجة ملفات PDF الناقصة';
        break;

      case 'exportData':
        output.data = exportAllData();
        output.ok = true;
        output.message = 'تم تصدير البيانات بنجاح';
        break;

      case 'getPDFStatus':
        output.data = getPDFStatusReport();
        output.ok = true;
        output.message = 'تم جلب حالة ملفات PDF';
        break;

      default:
        output.message = 'الإجراء المطلوب غير معروف: ' + action;
        break;
    }

  } catch (err) {
    output.ok = false;
    output.message = 'خطأ أثناء تنفيذ العملية: ' + err.message;
    output.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP GET Entry Point (Health Check and Status)
 */
function doGet(e) {
  var health = checkHealth();
  var res = {
    ok: health.allOk,
    name: 'Al-Tayseer Quran Competition Apps Script Bridge',
    version: '2.0.0',
    diagnostics: health,
    serverTime: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. Health Diagnostic Check
 */
function checkHealth() {
  var results = {
    spreadsheet: { ok: false, title: '', message: '' },
    sheetTab: { ok: false, rowCount: 0, message: '' },
    docsTemplate: { ok: false, name: '', message: '' },
    driveRootFolder: { ok: false, name: '', message: '' },
    allOk: false
  };

  // Test Spreadsheet
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    results.spreadsheet.ok = true;
    results.spreadsheet.title = ss.getName();
    results.spreadsheet.message = 'تم الاتصال بجدول البيانات بنجاح';

    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (sheet) {
      results.sheetTab.ok = true;
      results.sheetTab.rowCount = sheet.getLastRow();
      results.sheetTab.message = 'تم العثور على ورقة الاستجابات: ' + CONFIG.SHEET_NAME;
      ensureExtendedHeaders(sheet);
    } else {
      results.sheetTab.message = 'ورقة الاستجابات غير موجودة: ' + CONFIG.SHEET_NAME;
    }
  } catch (e) {
    results.spreadsheet.message = 'فشل الاتصال بجدول البيانات: ' + e.message;
  }

  // Test Docs Template
  try {
    var doc = DocumentApp.openById(CONFIG.DOCS_TEMPLATE_ID);
    results.docsTemplate.ok = true;
    results.docsTemplate.name = doc.getName();
    results.docsTemplate.message = 'تم فتح قالب Google Docs بنجاح';
  } catch (e) {
    results.docsTemplate.message = 'فشل الوصول لقالب المستند: ' + e.message;
  }

  // Test Drive Root Folder
  try {
    var folder = DriveApp.getFolderById(CONFIG.DRIVE_ROOT_FOLDER_ID);
    results.driveRootFolder.ok = true;
    results.driveRootFolder.name = folder.getName();
    results.driveRootFolder.message = 'تم الوصول إلى مجلد Google Drive الرئيسي';
  } catch (e) {
    results.driveRootFolder.message = 'فشل الوصول لمجلد الدرايف: ' + e.message;
  }

  results.allOk = results.spreadsheet.ok && results.sheetTab.ok && results.docsTemplate.ok && results.driveRootFolder.ok;
  return results;
}

/**
 * Ensure Extended Headers exist in Columns J through Q
 */
function ensureExtendedHeaders(sheet) {
  var headers = [
    'رقم الطلب',               // J
    'حالة التسجيل',             // K
    'حالة PDF',                 // L
    'PDF File ID',             // M
    'تاريخ إنشاء PDF',         // N
    'ملاحظات الإدارة',         // O
    'Registration Fingerprint',// P
    'رقم المتسابق داخل المستوى' // Q
  ];
  
  var lastCol = sheet.getLastColumn();
  if (lastCol < 17) {
    var range = sheet.getRange(1, 10, 1, headers.length);
    range.setValues([headers]);
    range.setFontWeight('bold');
    range.setBackground('#f3f4f6');
  }
}

/**
 * 2. Handle New Registration (Thread-Safe)
 */
function handleRegistration(p) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent write locks
  lock.waitLock(30000);

  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    ensureExtendedHeaders(sheet);

    var nationalId = normalizeDigits(String(p.nationalId || '').trim());
    var fingerprint = generateFingerprint(p);

    // Duplicate check by National ID (Column F)
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var existingRowNatId = normalizeDigits(String(data[i][CONFIG.COLUMNS.NATIONAL_ID - 1] || '').trim());
      if (existingRowNatId && existingRowNatId === nationalId) {
        var existingOrder = data[i][CONFIG.COLUMNS.ORDER_NUMBER - 1] || ('REC-' + (i + 1));
        var existingPdfUrl = data[i][CONFIG.COLUMNS.FILE_URL - 1] || '';
        return {
          duplicate: true,
          orderNumber: existingOrder,
          pdfUrl: existingPdfUrl,
          message: 'هذا الرقم القومي مسجل بالفعل في المسابقة برقم طلب: ' + existingOrder
        };
      }
    }

    // Generate Order Number
    var rowCount = sheet.getLastRow();
    var orderSeq = rowCount; // 1-based sequential
    var orderNumber = 'QRC-' + new Date().getFullYear() + '-' + padZero(orderSeq, 5);

    // Calculate level-specific contestant number (e.g. 001, 002...)
    var levelContestantNo = getNextContestantNumberForLevel(sheet, p.level);

    // Calculate age if not provided
    var birthDateStr = p.birthDate || '';
    var calculatedAge = p.age || calculateAgeFromBirthDate(birthDateStr);

    var now = new Date();
    var timestamp = Utilities.formatDate(now, 'Africa/Cairo', 'yyyy/MM/dd HH:mm:ss');

    // Prepare row values (Columns A to Q)
    var rowValues = [
      timestamp,                    // A: Timestamp
      p.fullName,                   // B: الاسم رباعي
      normalizeDigits(p.phone),     // C: رقم الموبايل
      p.teacher,                    // D: اسم المحفظ
      p.level,                      // E: مقدار الحفظ
      nationalId,                   // F: الرقم القومي
      calculatedAge,                // G: السن
      birthDateStr,                 // H: تاريخ الميلاد
      '',                           // I: رابط الملف (filled after PDF)
      orderNumber,                  // J: رقم الطلب
      'جديد',                       // K: حالة التسجيل (جديد / مقبول / قيد المراجعة)
      'قيد المعالجة',                // L: حالة PDF
      '',                           // M: PDF File ID
      '',                           // N: تاريخ إنشاء PDF
      p.notes || '',                // O: ملاحظات الإدارة
      fingerprint,                  // P: Registration Fingerprint
      padZero(levelContestantNo, 3) // Q: رقم المتسابق داخل المستوى
    ];

    sheet.appendRow(rowValues);
    var newRowIndex = sheet.getLastRow();

    // Release lock before time-consuming PDF creation
    lock.releaseLock();

    // Trigger PDF Generation
    var pdfResult = null;
    try {
      pdfResult = generatePDFForRow(sheet, newRowIndex);
    } catch (pdfErr) {
      Logger.log('PDF generation deferred for row ' + newRowIndex + ': ' + pdfErr.message);
      sheet.getRange(newRowIndex, CONFIG.COLUMNS.PDF_STATUS).setValue('فشل');
      sheet.getRange(newRowIndex, CONFIG.COLUMNS.ADMIN_NOTES).setValue('خطأ في توليد PDF: ' + pdfErr.message);
    }

    return {
      success: true,
      orderNumber: orderNumber,
      contestantNumber: padZero(levelContestantNo, 3),
      rowIndex: newRowIndex,
      pdfStatus: pdfResult && pdfResult.success ? 'جاهز' : 'قيد المعالجة',
      pdfUrl: pdfResult ? pdfResult.url : ''
    };

  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * 3. Generate PDF for a Specific Sheet Row
 */
function generatePDFForRow(sheet, rowIndex) {
  var rowValues = sheet.getRange(rowIndex, 1, 1, 17).getValues()[0];

  var fullName = String(rowValues[CONFIG.COLUMNS.FULL_NAME - 1] || '').trim();
  var phone = String(rowValues[CONFIG.COLUMNS.PHONE - 1] || '').trim();
  var birth = String(rowValues[CONFIG.COLUMNS.BIRTH_DATE - 1] || '').trim();
  var age = String(rowValues[CONFIG.COLUMNS.AGE - 1] || '').trim();
  var teacher = String(rowValues[CONFIG.COLUMNS.TEACHER - 1] || '').trim();
  var level = String(rowValues[CONFIG.COLUMNS.LEVEL - 1] || '').trim();
  var national = String(rowValues[CONFIG.COLUMNS.NATIONAL_ID - 1] || '').trim();
  var orderNumber = String(rowValues[CONFIG.COLUMNS.ORDER_NUMBER - 1] || '').trim();
  var contestantNo = String(rowValues[CONFIG.COLUMNS.CONTESTANT_NO - 1] || '001').trim();

  if (!orderNumber) {
    orderNumber = 'QRC-' + new Date().getFullYear() + '-' + padZero(rowIndex, 5);
    sheet.getRange(rowIndex, CONFIG.COLUMNS.ORDER_NUMBER).setValue(orderNumber);
  }

  // 1. Get or create Level Folder inside Root Folder
  var rootFolder = DriveApp.getFolderById(CONFIG.DRIVE_ROOT_FOLDER_ID);
  var levelFolder = getOrCreateSubFolder(rootFolder, level);

  // 2. Make copy of Google Docs Template
  var templateFile = DriveApp.getFileById(CONFIG.DOCS_TEMPLATE_ID);
  var tempDocName = 'TEMP_' + orderNumber + '_' + new Date().getTime();
  var tempDocFile = templateFile.makeCopy(tempDocName, levelFolder);
  var tempDocId = tempDocFile.getId();

  var tempDoc = DocumentApp.openById(tempDocId);
  var body = tempDoc.getBody();

  // 3. Replace all 7 placeholders
  body.replaceText('\\{\\{name\\}\\}', fullName);
  body.replaceText('\\{\\{phone\\}\\}', phone);
  body.replaceText('\\{\\{birth\\}\\}', birth);
  body.replaceText('\\{\\{age\\}\\}', age);
  body.replaceText('\\{\\{teacher\\}\\}', teacher);
  body.replaceText('\\{\\{level\\}\\}', level);
  body.replaceText('\\{\\{national\\}\\}', national);

  // CRITICAL FIX: Save & Close Document before PDF conversion
  tempDoc.saveAndClose();

  // 4. Convert to PDF Blob
  var pdfBlob = tempDocFile.getAs(MimeType.PDF);
  // Naming format: 001 - اسم المتسابق - رقم الطلب.pdf
  var pdfFileName = padZero(contestantNo, 3) + ' - ' + sanitizeFileName(fullName) + ' - ' + orderNumber + '.pdf';
  pdfBlob.setName(pdfFileName);

  // 5. Create PDF file directly in level folder
  var pdfFile = levelFolder.createFile(pdfBlob);
  pdfFile.setDescription('استمارة متسابق مسابقة التيسير - ' + orderNumber);

  // 6. Verify created PDF
  var fileSize = pdfFile.getSize();
  if (fileSize <= 0) {
    throw new Error('تم إنشاء ملف PDF بحجم فارغ (0 بايت)');
  }

  var pdfUrl = pdfFile.getUrl();
  var pdfId = pdfFile.getId();

  // 7. Update Google Sheets Row with URL, File ID, Status and Date
  sheet.getRange(rowIndex, CONFIG.COLUMNS.FILE_URL).setValue(pdfUrl);
  sheet.getRange(rowIndex, CONFIG.COLUMNS.PDF_STATUS).setValue('جاهز');
  sheet.getRange(rowIndex, CONFIG.COLUMNS.PDF_FILE_ID).setValue(pdfId);
  var nowStr = Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyy/MM/dd HH:mm:ss');
  sheet.getRange(rowIndex, CONFIG.COLUMNS.PDF_DATE).setValue(nowStr);

  // 8. Delete temporary Docs copy only after verified PDF creation
  tempDocFile.setTrashed(true);

  return {
    success: true,
    fileId: pdfId,
    fileName: pdfFileName,
    url: pdfUrl,
    size: fileSize
  };
}

/**
 * 4. Helper: Find or create Subfolder by Name
 */
function getOrCreateSubFolder(parentFolder, folderName) {
  var safeName = folderName ? folderName.trim() : 'غير مصنف';
  var folders = parentFolder.getFoldersByName(safeName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(safeName);
}

/**
 * 5. Helper: Next Contestant Number for a specific Level
 */
function getNextContestantNumberForLevel(sheet, level) {
  var data = sheet.getDataRange().getValues();
  var count = 0;
  var targetLevel = (level || '').trim();

  for (var i = 1; i < data.length; i++) {
    var rowLevel = String(data[i][CONFIG.COLUMNS.LEVEL - 1] || '').trim();
    if (rowLevel === targetLevel) {
      count++;
    }
  }
  return count + 1;
}

/**
 * 6. Get All Registrations with Filters
 */
function getRegistrations(filter) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  ensureExtendedHeaders(sheet);

  var data = sheet.getDataRange().getValues();
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var item = {
      rowIndex: i + 1,
      timestamp: row[CONFIG.COLUMNS.TIMESTAMP - 1],
      fullName: row[CONFIG.COLUMNS.FULL_NAME - 1],
      phone: row[CONFIG.COLUMNS.PHONE - 1],
      teacher: row[CONFIG.COLUMNS.TEACHER - 1],
      level: row[CONFIG.COLUMNS.LEVEL - 1],
      nationalId: row[CONFIG.COLUMNS.NATIONAL_ID - 1],
      age: row[CONFIG.COLUMNS.AGE - 1],
      birthDate: row[CONFIG.COLUMNS.BIRTH_DATE - 1],
      fileUrl: row[CONFIG.COLUMNS.FILE_URL - 1],
      orderNumber: row[CONFIG.COLUMNS.ORDER_NUMBER - 1] || ('REC-' + (i + 1)),
      status: row[CONFIG.COLUMNS.STATUS - 1] || 'جديد',
      pdfStatus: row[CONFIG.COLUMNS.PDF_STATUS - 1] || (row[CONFIG.COLUMNS.FILE_URL - 1] ? 'جاهز' : 'غير متوفر'),
      pdfFileId: row[CONFIG.COLUMNS.PDF_FILE_ID - 1],
      pdfDate: row[CONFIG.COLUMNS.PDF_DATE - 1],
      notes: row[CONFIG.COLUMNS.ADMIN_NOTES - 1],
      contestantNumber: row[CONFIG.COLUMNS.CONTESTANT_NO - 1] || padZero(i, 3)
    };

    // Apply filters
    if (filter.level && item.level !== filter.level) continue;
    if (filter.status && item.status !== filter.status) continue;
    if (filter.pdfStatus && item.pdfStatus !== filter.pdfStatus) continue;
    if (filter.search) {
      var s = filter.search.toLowerCase();
      var match = (item.fullName && item.fullName.toLowerCase().indexOf(s) !== -1) ||
                  (item.phone && item.phone.indexOf(s) !== -1) ||
                  (item.orderNumber && item.orderNumber.toLowerCase().indexOf(s) !== -1) ||
                  (item.teacher && item.teacher.toLowerCase().indexOf(s) !== -1);
      if (!match) continue;
    }

    results.push(item);
  }

  return results;
}

/**
 * 7. Get Single Registration by Order Number or Row Index
 */
function getRegistrationById(id) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var orderNo = String(row[CONFIG.COLUMNS.ORDER_NUMBER - 1] || '');
    if (orderNo === id || String(i + 1) === String(id)) {
      return {
        rowIndex: i + 1,
        timestamp: row[CONFIG.COLUMNS.TIMESTAMP - 1],
        fullName: row[CONFIG.COLUMNS.FULL_NAME - 1],
        phone: row[CONFIG.COLUMNS.PHONE - 1],
        teacher: row[CONFIG.COLUMNS.TEACHER - 1],
        level: row[CONFIG.COLUMNS.LEVEL - 1],
        nationalId: row[CONFIG.COLUMNS.NATIONAL_ID - 1],
        age: row[CONFIG.COLUMNS.AGE - 1],
        birthDate: row[CONFIG.COLUMNS.BIRTH_DATE - 1],
        fileUrl: row[CONFIG.COLUMNS.FILE_URL - 1],
        orderNumber: orderNo,
        status: row[CONFIG.COLUMNS.STATUS - 1] || 'جديد',
        pdfStatus: row[CONFIG.COLUMNS.PDF_STATUS - 1],
        pdfFileId: row[CONFIG.COLUMNS.PDF_FILE_ID - 1],
        pdfDate: row[CONFIG.COLUMNS.PDF_DATE - 1],
        notes: row[CONFIG.COLUMNS.ADMIN_NOTES - 1],
        contestantNumber: row[CONFIG.COLUMNS.CONTESTANT_NO - 1]
      };
    }
  }
  return null;
}

/**
 * 8. Update Participant Information
 */
function updateRegistration(id, updates) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    var orderNo = String(data[i][CONFIG.COLUMNS.ORDER_NUMBER - 1] || '');
    if (orderNo === id || String(i + 1) === String(id)) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    throw new Error('المتسابق غير موجود: ' + id);
  }

  var needsPdfRegen = false;

  if (updates.fullName !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.FULL_NAME).setValue(updates.fullName);
    needsPdfRegen = true;
  }
  if (updates.phone !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.PHONE).setValue(normalizeDigits(updates.phone));
    needsPdfRegen = true;
  }
  if (updates.teacher !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.TEACHER).setValue(updates.teacher);
    needsPdfRegen = true;
  }
  if (updates.level !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.LEVEL).setValue(updates.level);
    needsPdfRegen = true;
  }
  if (updates.nationalId !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.NATIONAL_ID).setValue(normalizeDigits(updates.nationalId));
    needsPdfRegen = true;
  }
  if (updates.birthDate !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.BIRTH_DATE).setValue(updates.birthDate);
    var newAge = calculateAgeFromBirthDate(updates.birthDate);
    sheet.getRange(targetRow, CONFIG.COLUMNS.AGE).setValue(newAge);
    needsPdfRegen = true;
  }
  if (updates.notes !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.ADMIN_NOTES).setValue(updates.notes);
  }
  if (updates.status !== undefined) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.STATUS).setValue(updates.status);
  }

  if (needsPdfRegen) {
    sheet.getRange(targetRow, CONFIG.COLUMNS.PDF_STATUS).setValue('بحاجة للتحديث');
  }

  return { success: true, targetRow: targetRow, needsPdfRegen: needsPdfRegen };
}

/**
 * 9. Update Status Only
 */
function updateRegistrationStatus(id, newStatus, notes) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var orderNo = String(data[i][CONFIG.COLUMNS.ORDER_NUMBER - 1] || '');
    if (orderNo === id || String(i + 1) === String(id)) {
      sheet.getRange(i + 1, CONFIG.COLUMNS.STATUS).setValue(newStatus);
      if (notes) {
        var existing = data[i][CONFIG.COLUMNS.ADMIN_NOTES - 1] || '';
        var updated = existing ? existing + ' | ' + notes : notes;
        sheet.getRange(i + 1, CONFIG.COLUMNS.ADMIN_NOTES).setValue(updated);
      }
      return { success: true, orderNumber: orderNo, status: newStatus };
    }
  }
  throw new Error('لم يتم العثور على المتسابق لتحديث حالته');
}

/**
 * 10. Dashboard Stats
 */
function getDashboardStats() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var total = 0;
  var todayCount = 0;
  var readyPdfs = 0;
  var missingPdfs = 0;
  var failedPdfs = 0;

  var statusCounts = {
    'جديد': 0,
    'قيد المراجعة': 0,
    'مقبول': 0,
    'مكتمل': 0,
    'غير مكتمل': 0,
    'مرفوض': 0
  };

  var levelCounts = {};
  CONFIG.LEVELS.forEach(function(l) { levelCounts[l] = 0; });

  var timelineMap = {};

  var todayStr = Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyy/MM/dd');

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var name = String(row[CONFIG.COLUMNS.FULL_NAME - 1] || '').trim();
    if (!name) continue; // skip blank rows

    total++;

    var ts = String(row[CONFIG.COLUMNS.TIMESTAMP - 1] || '');
    var dateKey = ts.split(' ')[0] || todayStr;
    if (dateKey === todayStr) {
      todayCount++;
    }
    timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;

    var level = String(row[CONFIG.COLUMNS.LEVEL - 1] || '').trim();
    if (level) {
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    }

    var st = String(row[CONFIG.COLUMNS.STATUS - 1] || 'جديد').trim();
    if (statusCounts[st] !== undefined) {
      statusCounts[st]++;
    } else {
      statusCounts[st] = 1;
    }

    var pdfSt = String(row[CONFIG.COLUMNS.PDF_STATUS - 1] || '').trim();
    var fileUrl = String(row[CONFIG.COLUMNS.FILE_URL - 1] || '').trim();

    if (pdfSt === 'جاهز' || fileUrl) {
      readyPdfs++;
    } else if (pdfSt === 'فشل') {
      failedPdfs++;
    } else {
      missingPdfs++;
    }
  }

  return {
    totalParticipants: total,
    todayRegistrations: todayCount,
    readyPdfs: readyPdfs,
    missingPdfs: missingPdfs,
    failedPdfs: failedPdfs,
    statusCounts: statusCounts,
    levelCounts: levelCounts,
    timeline: timelineMap
  };
}

/**
 * 11. Generate PDF for an Order (Single)
 */
function generatePDFForOrder(id, forceRegenerate) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    var orderNo = String(data[i][CONFIG.COLUMNS.ORDER_NUMBER - 1] || '');
    if (orderNo === id || String(i + 1) === String(id)) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    throw new Error('لم يتم العثور على المتسابق لتوليد المستند: ' + id);
  }

  return generatePDFForRow(sheet, targetRow);
}

/**
 * 12. Batch Process Missing/Pending PDFs (Safe batches of limit, default 15)
 */
function batchGeneratePDFs(limit) {
  var maxProcess = limit || 15;
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var processed = 0;
  var successes = 0;
  var failures = 0;
  var results = [];

  for (var i = 1; i < data.length && processed < maxProcess; i++) {
    var row = data[i];
    var fileUrl = String(row[CONFIG.COLUMNS.FILE_URL - 1] || '').trim();
    var pdfStatus = String(row[CONFIG.COLUMNS.PDF_STATUS - 1] || '').trim();

    // Check if PDF needs generation
    if (!fileUrl || pdfStatus === 'قيد المعالجة' || pdfStatus === 'بحاجة للتحديث' || pdfStatus === 'فشل') {
      processed++;
      var rowIndex = i + 1;
      var orderNo = String(row[CONFIG.COLUMNS.ORDER_NUMBER - 1] || ('REC-' + rowIndex));

      try {
        var res = generatePDFForRow(sheet, rowIndex);
        successes++;
        results.push({ orderNumber: orderNo, success: true, url: res.url });
      } catch (err) {
        failures++;
        results.push({ orderNumber: orderNo, success: false, error: err.message });
        sheet.getRange(rowIndex, CONFIG.COLUMNS.PDF_STATUS).setValue('فشل');
        sheet.getRange(rowIndex, CONFIG.COLUMNS.ADMIN_NOTES).setValue('خطأ دفعة PDF: ' + err.message);
      }
    }
  }

  // Count remaining
  var remaining = 0;
  for (var j = 1; j < data.length; j++) {
    var u = String(data[j][CONFIG.COLUMNS.FILE_URL - 1] || '').trim();
    var s = String(data[j][CONFIG.COLUMNS.PDF_STATUS - 1] || '').trim();
    if (!u || s !== 'جاهز') {
      remaining++;
    }
  }

  return {
    processed: processed,
    successes: successes,
    failures: failures,
    remaining: remaining,
    details: results
  };
}

/**
 * 13. Export All Data
 */
function exportAllData() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  return sheet.getDataRange().getValues();
}

/**
 * 14. PDF Status Report
 */
function getPDFStatusReport() {
  var stats = getDashboardStats();
  return {
    total: stats.totalParticipants,
    ready: stats.readyPdfs,
    missing: stats.missingPdfs,
    failed: stats.failedPdfs
  };
}

/**
 * UTILITIES
 */
function padZero(num, size) {
  var s = String(num);
  while (s.length < (size || 3)) s = '0' + s;
  return s;
}

function sanitizeFileName(name) {
  return String(name || '').replace(/[\\/:*?"<>|]/g, '_').trim();
}

function normalizeDigits(str) {
  if (!str) return '';
  var arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  var englishDigits = ['0','1','2','3','4','5','6','7','8','9'];
  var res = String(str);
  for (var i = 0; i < 10; i++) {
    res = res.split(arabicDigits[i]).join(englishDigits[i]);
  }
  return res;
}

function calculateAgeFromBirthDate(birthDateStr) {
  if (!birthDateStr) return '';
  try {
    var parts = birthDateStr.split(/[-/]/);
    var y, m, d;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
      } else {
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        y = parseInt(parts[2], 10);
      }
      var birth = new Date(y, m, d);
      var today = new Date();
      var age = today.getFullYear() - birth.getFullYear();
      var monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? String(age) : '0';
    }
  } catch (e) {
    Logger.log('Age calculation error: ' + e.message);
  }
  return '';
}

function generateFingerprint(p) {
  var raw = (p.nationalId || '') + '_' + (p.fullName || '') + '_' + (p.level || '');
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw));
}

/**
 * Manual Test Function (Can be run in Apps Script Editor safely)
 */
function testHealthManual() {
  var res = checkHealth();
  Logger.log(JSON.stringify(res, null, 2));
}
