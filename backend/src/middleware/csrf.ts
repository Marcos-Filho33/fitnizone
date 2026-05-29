import { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const isProduction = process.env.NODE_ENV === 'production';

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.includes(req.method)) {
    const newCsrfToken = generateCsrfToken();
    res.cookie('csrfToken', newCsrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });
    res.setHeader('X-CSRF-Token', newCsrfToken);
    return next();
  }

  const cookieToken = req.cookies?.csrfToken as string | undefined;
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: 'Token CSRF ausente.' });
  }

  if (cookieToken !== headerToken) {
    return res.status(403).json({ message: 'Token CSRF inválido.' });
  }

  next();
}
