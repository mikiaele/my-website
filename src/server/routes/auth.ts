import { Router, Request, Response } from 'express';
import {
  registerWithPassword,
  verifyPasswordLogin,
  findUserByEmail,
  getOrCreateUser,
} from '../../db/users.ts';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { adminAuth } from '../../lib/firebase-admin.ts';
import { db } from '../../db/index.ts';
import { administratorAuditLogs } from '../../db/schema.ts';

import { signSessionToken } from '../../lib/session.ts';

export const authRouter = Router();

// Register with email and password
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Default to 'customer', or allow 'seller' (never allow direct admin self-registration!)
    const userRole = role === 'seller' ? 'seller' : 'customer';

    const user = await registerWithPassword(email, password, name, phone || '', userRole);
    const token = signSessionToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Login with email and password
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await verifyPasswordLogin(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signSessionToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Firebase Token Sync (for Google Auth)
authRouter.post('/firebase-sync', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    const decodedToken = await adminAuth.verifyIdToken(token);

    const user = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || `${decodedToken.uid}@melamarket.et`,
      decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'User')
    );

    res.json({
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Firebase sync error:', error);
    res.status(401).json({ error: 'Invalid Firebase authentication token' });
  }
});

// Get Current User Profile
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Password Reset Simulation
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = await findUserByEmail(email);
  if (!user) {
    // For security, do not leak whether account exists
    return res.json({ message: 'If an account exists with this email, password reset instructions have been sent.' });
  }
  // In production, an email would be dispatched. Return success message.
  res.json({
    message: 'If an account exists with this email, password reset instructions have been sent.',
  });
});
