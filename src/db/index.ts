import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _neonPostgresPool: Pool | undefined;
}

export const isDatabaseConfigured = (): boolean => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
};

export const createPool = (): Pool => {
  if (!global._neonPostgresPool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.warn(
        '⚠️ DATABASE_URL is not set. Please configure DATABASE_URL in Google AI Studio Secrets with your Neon PostgreSQL connection string.'
      );
    }

    const isNeon = connectionString && (connectionString.includes('neon.tech') || connectionString.includes('sslmode=require'));

    global._neonPostgresPool = new Pool({
      connectionString: connectionString || undefined,
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
      max: 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

    global._neonPostgresPool.on('error', (err) => {
      console.error('Unexpected error on idle Neon PostgreSQL pool client:', err);
    });
  }
  return global._neonPostgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });

export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  database?: string;
  version?: string;
}> {
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      message: 'DATABASE_URL secret is not configured. Please add DATABASE_URL in Google AI Studio Secrets.',
    };
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT current_database() as db_name, version() as db_version;');
      return {
        connected: true,
        message: 'Successfully connected to Neon PostgreSQL database.',
        database: res.rows[0]?.db_name,
        version: res.rows[0]?.db_version,
      };
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Neon database connection check failed:', error);
    return {
      connected: false,
      message: error.message || 'Failed to connect to Neon PostgreSQL database.',
    };
  }
}
