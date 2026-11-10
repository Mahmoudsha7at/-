/**
 * Al-Tayseer Quran Competition Management Platform
 * Full-Stack Express Server with Vite Middleware
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { CONFIG } from './server/config.js';
import { 
  validateParticipantSubmission, 
  maskNationalId, 
  normalizeDigits 
} from './server/validation.js';
import { workspaceBridge } from './server/services/workspaceBridge.js';
import { requireAdminAuth, isAllowedAdminEmail } from './server/middleware/auth.js';
import { CompetitionSettings } from './server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory competition settings store (mutable by administrators)
let currentSettings: CompetitionSettings = {
  ...CONFIG.DEFAULT_SETTINGS,
  levels: [...CONFIG.LEVELS],
  allowedAdminEmails: [...CONFIG.ADMIN_EMAILS],
  appsScriptUrl: CONFIG.APPS_SCRIPT_URL,
  appsScriptSecretConfigured: Boolean(CONFIG.APPS_SCRIPT_SECRET)
};

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

/**
 * GET /api/settings - Public competition settings
 */
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    data: {
      competitionTitle: currentSettings.competitionTitle,
      organizationName: currentSettings.organizationName,
      villageName: currentSettings.villageName,
      registrationOpen: currentSettings.registrationOpen,
      registrationDeadline: currentSettings.registrationDeadline,
      competitionStartDate: currentSettings.competitionStartDate,
      contactPhone: currentSettings.contactPhone,
      contactLocation: currentSettings.contactLocation,
      rules: currentSettings.rules,
      faq: currentSettings.faq,
      levels: currentSettings.levels
    }
  });
});

/**
 * GET /api/health - Diagnostic Workspace Health Check
 */
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const health = await workspaceBridge.checkHealth();
    res.json({
      ok: health.allOk,
      data: health,
      resources: {
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        docsTemplateId: CONFIG.DOCS_TEMPLATE_ID,
        driveRootFolderId: CONFIG.DRIVE_ROOT_FOLDER_ID
      }
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: 'فشل في تشغيل فحص الاتصال: ' + err.message
    });
  }
});

/**
 * POST /api/registrations - Public Participant Registration
 */
app.post('/api/registrations', async (req: Request, res: Response) => {
  try {
    if (!currentSettings.registrationOpen) {
      return res.status(403).json({
        ok: false,
        message: 'التسجيل في المسابقة مغلق حالياً بقرار من إدارة المؤسسة'
      });
    }

    const submission = req.body;
    const validation = validateParticipantSubmission(submission, currentSettings.levels);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: 'يرجى تصحيح الأخطاء في استمارة التسجيل',
        errors: validation.errors
      });
    }

    // Submit to Google Workspace Bridge
    const result = await workspaceBridge.submitRegistration(validation.cleaned);

    if (result.duplicate) {
      return res.status(409).json({
        ok: false,
        duplicate: true,
        orderNumber: result.orderNumber,
        message: result.message || 'هذا المتسابق مسجل بالفعل في المسابقة'
      });
    }

    return res.status(201).json({
      ok: true,
      message: 'تم تسجيل المتسابق بنجاح في مسابقة مؤسسة التيسير الخيرية',
      data: {
        orderNumber: result.orderNumber,
        contestantNumber: result.contestantNumber,
        fullName: validation.cleaned.fullName,
        level: validation.cleaned.level,
        pdfStatus: result.pdfStatus,
        pdfUrl: result.pdfUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err: any) {
    console.error('Registration processing error:', err);
    return res.status(500).json({
      ok: false,
      message: 'حدث خطأ في معالجة طلب التسجيل: ' + err.message
    });
  }
});

/**
 * GET /api/registrations/status/:orderNumber - Public lookup
 */
app.get('/api/registrations/status/:orderNumber', async (req: Request, res: Response) => {
  try {
    const orderNumber = req.params.orderNumber.trim();
    const participant = await workspaceBridge.getRegistrationById(orderNumber);

    if (!participant) {
      return res.status(404).json({
        ok: false,
        message: 'لم يتم العثور على طلب تسجيل بهذا الرقم'
      });
    }

    // Return safe masked public data
    res.json({
      ok: true,
      data: {
        orderNumber: participant.orderNumber,
        contestantNumber: participant.contestantNumber,
        fullName: participant.fullName,
        level: participant.level,
        status: participant.status,
        pdfStatus: participant.pdfStatus,
        pdfUrl: participant.fileUrl || undefined,
        timestamp: participant.timestamp
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * POST /api/admin/auth/login - Administrator Authentication
 */
app.post('/api/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Master admin password verification
  if (password && password === CONFIG.ADMIN_KEY) {
    return res.json({
      ok: true,
      token: CONFIG.ADMIN_KEY,
      user: {
        email: email || CONFIG.ADMIN_EMAILS[0],
        name: 'مسؤول المسابقة',
        role: 'super_admin'
      }
    });
  }

  // Email allowlist verification
  if (email && isAllowedAdminEmail(email)) {
    return res.json({
      ok: true,
      token: 'admin_session_' + Date.now(),
      user: {
        email: email.toLowerCase(),
        name: email.split('@')[0],
        role: 'admin'
      }
    });
  }

  return res.status(401).json({
    ok: false,
    message: 'بيانات الدخول غير صحيحة أو البريد الإلكتروني غير مصرح له كمسؤول'
  });
});

// -------------------------------------------------------------
// PROTECTED ADMIN API ROUTES
// -------------------------------------------------------------

/**
 * GET /api/admin/auth/verify - Verify session
 */
app.get('/api/admin/auth/verify', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    ok: true,
    user: req.admin
  });
});

/**
 * GET /api/admin/stats - Overview Dashboard Statistics
 */
app.get('/api/admin/stats', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const stats = await workspaceBridge.getDashboardStats();
    res.json({ ok: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * GET /api/admin/registrations - Search, filter, pagination
 */
app.get('/api/admin/registrations', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const params = {
      level: req.query.level as string,
      teacher: req.query.teacher as string,
      status: req.query.status as string,
      pdfStatus: req.query.pdfStatus as string,
      search: req.query.search as string,
      page: parseInt((req.query.page as string) || '1', 10),
      pageSize: parseInt((req.query.pageSize as string) || '15', 10)
    };

    const result = await workspaceBridge.getRegistrations(params);

    // Mask national IDs for general table listing
    const sanitizedItems = result.items.map(item => ({
      ...item,
      maskedNationalId: maskNationalId(item.nationalId),
      // Only keep full national ID if explicitly requested
      nationalId: maskNationalId(item.nationalId)
    }));

    res.json({
      ok: true,
      data: {
        ...result,
        items: sanitizedItems
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * GET /api/admin/registrations/:id - Single participant details (unmasked for authorized admin)
 */
app.get('/api/admin/registrations/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const participant = await workspaceBridge.getRegistrationById(id);

    if (!participant) {
      return res.status(404).json({ ok: false, message: 'المتسابق غير موجود' });
    }

    res.json({ ok: true, data: participant });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * PUT /api/admin/registrations/:id - Update participant details
 */
app.put('/api/admin/registrations/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updated = await workspaceBridge.updateRegistration(id, updates);
    res.json({
      ok: true,
      message: 'تم تحديث بيانات المتسابق بنجاح',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * PATCH /api/admin/registrations/:id/status - Update status and notes
 */
app.patch('/api/admin/registrations/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status, notes } = req.body;
    const updated = await workspaceBridge.updateStatus(id, status, notes);
    res.json({
      ok: true,
      message: 'تم تحديث حالة التسجيل بنجاح',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * POST /api/admin/pdf/generate/:orderNumber - Single PDF Generation / Regeneration
 */
app.post('/api/admin/pdf/generate/:orderNumber', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const orderNumber = req.params.orderNumber;
    const force = Boolean(req.body.force);
    const result = await workspaceBridge.generateParticipantPdf(orderNumber, force);

    res.json({
      ok: true,
      message: 'تم توليد ملف PDF بنجاح وحفظه في مجلد المستوى المحدد',
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * POST /api/admin/pdf/batch - Batch Generation of Missing PDFs
 */
app.post('/api/admin/pdf/batch', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.body.limit || '15', 10);
    const result = await workspaceBridge.batchGenerateMissingPdfs(limit);

    res.json({
      ok: true,
      message: `تمت معالجة دفعة من ${result.processed} ملفات PDF`,
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * GET /api/admin/export - CSV Export with UTF-8 BOM
 */
app.get('/api/admin/export', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const csvData = await workspaceBridge.getExportCsv();
    const filename = `AlTayseer_Participants_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * GET /api/admin/bridge/config - Current Google Workspace connection info
 */
app.get('/api/admin/bridge/config', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    ok: true,
    data: workspaceBridge.getBridgeConfig()
  });
});

/**
 * POST /api/admin/bridge/config - Update Apps Script URL & Secret
 */
app.post('/api/admin/bridge/config', requireAdminAuth, (req: Request, res: Response) => {
  const { url, secret } = req.body;
  if (!url) {
    return res.status(400).json({ ok: false, message: 'رابط تطبيق Apps Script مطلوب' });
  }

  workspaceBridge.updateConfig(url, secret);
  currentSettings.appsScriptUrl = url;
  if (secret) currentSettings.appsScriptSecretConfigured = true;

  res.json({
    ok: true,
    message: 'تم تحديث إعدادات اتصال Google Apps Script بنجاح',
    data: workspaceBridge.getBridgeConfig()
  });
});

/**
 * PUT /api/admin/settings - Update competition settings
 */
app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updates = req.body;
  currentSettings = {
    ...currentSettings,
    ...updates
  };

  res.json({
    ok: true,
    message: 'تم حفظ إعدادات المسابقة بنجاح',
    data: currentSettings
  });
});

// -------------------------------------------------------------
// VITE AND STATIC ASSETS SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`مسابقة مؤسسة التيسير الخيرية لحفظة القرآن الكريم بقرية المنزلة`);
    console.log(`Server running at http://0.0.0.0:${CONFIG.PORT}`);
    console.log(`Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`====================================================`);
  });
}

startServer();
