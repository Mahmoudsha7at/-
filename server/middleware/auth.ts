/**
 * Authentication and Admin Security Middleware
 * Al-Tayseer Quran Memorization Competition
 */

import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../config.js';

export interface AdminUser {
  email?: string;
  name?: string;
  role: 'super_admin' | 'admin';
  authenticatedAt: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
    }
  }
}

/**
 * Validates whether an email belongs to the administrator allowlist
 */
export function isAllowedAdminEmail(email?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return CONFIG.ADMIN_EMAILS.includes(normalized);
}

/**
 * Protects administrative routes
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'] as string;
  const adminEmail = req.headers['x-admin-email'] as string;

  // 1. Direct Master Admin Key check
  if (adminKey && adminKey === CONFIG.ADMIN_KEY) {
    req.admin = {
      email: adminEmail || CONFIG.ADMIN_EMAILS[0],
      name: 'مسؤول النظام الرئيسي',
      role: 'super_admin',
      authenticatedAt: new Date().toISOString()
    };
    return next();
  }

  // 2. Bearer token check (can be Firebase Auth ID Token or Session Key)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    // Check if token matches admin secret
    if (token === CONFIG.ADMIN_KEY) {
      req.admin = {
        email: adminEmail || CONFIG.ADMIN_EMAILS[0],
        name: 'مسؤول النظام (مفتاح المرور)',
        role: 'super_admin',
        authenticatedAt: new Date().toISOString()
      };
      return next();
    }

    // Check if email is in allowlist and token provided
    if (adminEmail && isAllowedAdminEmail(adminEmail) && token.length > 10) {
      req.admin = {
        email: adminEmail.toLowerCase(),
        name: adminEmail.split('@')[0],
        role: 'admin',
        authenticatedAt: new Date().toISOString()
      };
      return next();
    }
  }

  // Unauthorized response
  return res.status(401).json({
    ok: false,
    message: 'غير مصرح: يجب تسجيل الدخول كمسؤول معتمد في مسابقة التيسير',
    errorCode: 'ADMIN_UNAUTHORIZED'
  });
}
