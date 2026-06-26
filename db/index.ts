import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 30000,
  });
}

const globalForDb = globalThis as typeof globalThis & {
  __dbPool?: Pool;
};

globalForDb.__dbPool ??= createPool();
const pool = globalForDb.__dbPool;

export const db = drizzle(pool, { schema });
export { schema, pool };
export default db;
