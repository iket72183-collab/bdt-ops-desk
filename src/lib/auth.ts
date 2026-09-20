import type { Request, Response, NextFunction } from 'express';
import { config } from './config.js';

/**
 * When MCP_AUTH_TOKEN is set, require Authorization: Bearer <token>.
 * On failure return 401 without WWW-Authenticate (Alexa+/hackathon-friendly).
 */
export function bearerAuth(req: Request, res: Response, next: NextFunction): void {
  const expected = config.mcpAuthToken;
  if (!expected) {
    next();
    return;
  }

  const header = req.header('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();

  if (!token || token !== expected) {
    res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized' },
      id: null,
    });
    return;
  }

  next();
}
