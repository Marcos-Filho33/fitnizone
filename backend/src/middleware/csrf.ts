import { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import { env } from '../lib/env';

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.csrfToken as string | undefined;
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: 'Token CSRF ausente.' });
  }

  if (headerToken === cookieToken) {
    next();
    return;
  }

  const expected = crypto
    .createHmac('sha256', env.csrfSecret)
    .update(cookieToken)
    .digest('hex');

  if (expected !== headerToken) {
    return res.status(403).json({ message: 'Token CSRF inválido.' });
  }

  next();
}
