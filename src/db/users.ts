import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function getOrCreateUser(uid: string, email: string, name?: string, phone?: string, role?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const [newUser] = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        phone: phone || null,
        role: role || 'customer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || email.split('@')[0],
        },
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database user sync failed', { cause: error });
  }
}

export async function findUserByEmail(email: string) {
  try {
    const found = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    return found[0] || null;
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw new Error('User query failed', { cause: error });
  }
}

export async function findUserById(id: number) {
  try {
    const found = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return found[0] || null;
  } catch (error) {
    console.error('Error in findUserById:', error);
    throw new Error('User query failed', { cause: error });
  }
}

export async function findUserByUid(uid: string) {
  try {
    const found = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return found[0] || null;
  } catch (error) {
    console.error('Error in findUserByUid:', error);
    throw new Error('User query failed', { cause: error });
  }
}

export async function registerWithPassword(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: 'customer' | 'seller' = 'customer'
) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const uid = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  const [created] = await db
    .insert(users)
    .values({
      uid,
      email: email.toLowerCase().trim(),
      name,
      phone,
      role,
      passwordHash,
    })
    .returning();

  return created;
}

export async function verifyPasswordLogin(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return user;
}
