import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getPool, isDbConnected, memoryStore } from './db';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Session duration: 14 days
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export function getAdminServerSecret(): string {
  return process.env.ADMIN_SERVER_SECRET || 'mela_market_admin_server_secret_default_key';
}

export function getAdminSetupMasterKey(): string {
  return process.env.ADMIN_SETUP_MASTER_KEY || 'Admin@MelaMarket2026!';
}

// Generate secure session token
export function generateSessionToken(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const signature = crypto
    .createHmac('sha256', getAdminServerSecret())
    .update(randomBytes)
    .digest('hex')
    .substring(0, 16);
  return `${randomBytes}.${signature}`;
}

// Validate token format and integrity
export function verifyTokenSignature(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [randomBytes, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getAdminServerSecret())
    .update(randomBytes)
    .digest('hex')
    .substring(0, 16);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

// Save session
export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  if (isDbConnected()) {
    const pool = getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO sessions (id, user_id, expires_at)
         VALUES ($1, $2, $3)`,
        [token, userId, expiresAt]
      );
      return token;
    }
  }

  // Memory fallback
  memoryStore.sessions.push({
    id: token,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
  });
  return token;
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  if (isDbConnected()) {
    const pool = getPool();
    if (pool) {
      await pool.query(`DELETE FROM sessions WHERE id = $1`, [token]);
      return;
    }
  }

  memoryStore.sessions = memoryStore.sessions.filter((s) => s.id !== token);
}

// Get user by session token
export async function getUserByToken(token: string): Promise<User | null> {
  if (!token) return null;

  if (isDbConnected()) {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at
           FROM sessions s
           JOIN users u ON s.user_id = u.id
           WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
          [token]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            role: row.role,
            created_at: row.created_at,
          };
        }
      } catch (err) {
        console.error('[Mela Market Auth] Error checking session:', err);
      }
    }
  }

  // Fallback to memory
  const session = memoryStore.sessions.find(
    (s) => s.id === token && new Date(s.expires_at) > new Date()
  );
  if (!session) return null;

  const foundUser = memoryStore.users.find((u) => u.id === session.user_id);
  if (!foundUser) return null;

  return {
    id: foundUser.id,
    full_name: foundUser.full_name,
    email: foundUser.email,
    phone: foundUser.phone,
    role: foundUser.role,
    created_at: foundUser.created_at,
  };
}

// Extract auth token from request
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.cookies && req.cookies.mela_session) {
    return req.cookies.mela_session;
  }
  return null;
}

// Middleware: Authenticate user (optional)
export async function authOptional(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const user = await getUserByToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

// Middleware: Require logged in user
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to continue.' });
  }

  const user = await getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  req.user = user;
  next();
}

// Middleware: Require Admin role
export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Administrator authentication required.' });
  }

  const user = await getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  req.user = user;
  next();
}
