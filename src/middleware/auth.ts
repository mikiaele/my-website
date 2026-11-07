import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { findUserByUid, findUserById, getOrCreateUser } from '../db/users.ts';
import { verifySessionToken } from '../lib/session.ts';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    uid: string;
    email: string;
    name: string;
    role: string;
    phone?: string | null;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // 1. Check if it's a signed local session token (verified with ADMIN_SERVER_SECRET)
  if (token.startsWith('mela_sess_')) {
    try {
      const { valid, userId } = verifySessionToken(token);
      if (!valid || !userId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
      }

      const dbUser = await findUserById(userId);
      if (!dbUser) {
        return res.status(401).json({ error: 'Unauthorized: User account not found' });
      }

      req.user = {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        phone: dbUser.phone,
      };
      return next();
    } catch (err) {
      console.error('Session verification error:', err);
      return res.status(401).json({ error: 'Unauthorized: Invalid session' });
    }
  }

  // 2. Otherwise verify as Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || `${decodedToken.uid}@melamarket.et`,
      decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'User')
    );

    req.user = {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      phone: dbUser.phone,
    };
    return next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (token.startsWith('mela_sess_')) {
    try {
      const { valid, userId } = verifySessionToken(token);
      if (valid && userId) {
        const dbUser = await findUserById(userId);
        if (dbUser) {
          req.user = {
            id: dbUser.id,
            uid: dbUser.uid,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            phone: dbUser.phone,
          };
        }
      }
    } catch {
      // Ignore in optional
    }
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || `${decodedToken.uid}@melamarket.et`,
      decodedToken.name
    );
    req.user = {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      phone: dbUser.phone,
    };
  } catch {
    // Ignore in optional auth
  }
  return next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Login required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireSeller = requireRole(['seller', 'admin']);
