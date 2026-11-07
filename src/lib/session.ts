import crypto from 'crypto';

const getSecret = (): string => {
  return process.env.ADMIN_SERVER_SECRET || 'mela_secure_default_server_secret_2026';
};

export function signSessionToken(userId: number): string {
  const secret = getSecret();
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex').substring(0, 24);
  return `mela_sess_${userId}_${timestamp}_${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; userId?: number } {
  if (!token || !token.startsWith('mela_sess_')) {
    return { valid: false };
  }

  const parts = token.split('_');
  // Format: ['mela', 'sess', userId, timestamp, signature]
  if (parts.length < 5) {
    return { valid: false };
  }

  const userId = parseInt(parts[2], 10);
  const timestamp = parseInt(parts[3], 10);
  const signature = parts[4];

  if (isNaN(userId) || isNaN(timestamp) || !signature) {
    return { valid: false };
  }

  const secret = getSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(`${userId}:${timestamp}`).digest('hex').substring(0, 24);

  if (signature !== expectedSig) {
    return { valid: false };
  }

  return { valid: true, userId };
}
