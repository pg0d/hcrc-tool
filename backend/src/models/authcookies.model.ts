import { pool } from '../db';
import type { QueryResult } from 'pg';

export type AuthCookie = {
  id: number;
  proxy_id: number | null;
  account_id: number;
  cookie_url: string;
  date_generated?: string;
};

export type AuthCookieWithDetails = {
  id: number;
  cookie_url: string;
  date_generated: string;
  account: {
    id: number;
    email: string;
  };
  proxy?: {
    id: number;
    host: string;
    port: number;
  } | null;
};

export async function getAllAuthCookies(): Promise<AuthCookieWithDetails[]> {
  const result: QueryResult = await pool.query(`
    SELECT
      ac.id AS cookie_id,
      ac.cookie_url,
      ac.date_generated,
      a.id AS account_id,
      a.username AS username,
      p.id AS proxy_id,
      p.host AS proxy_host,
      p.port AS proxy_port
    FROM authcookies ac
    JOIN accounts a ON ac.account_id = a.id
    LEFT JOIN proxies p ON ac.proxy_id = p.id
    ORDER BY ac.date_generated DESC
  `);

  return result.rows.map(row => ({
    id: row.cookie_id,
    cookie_url: row.cookie_url,
    date_generated: row.date_generated,
    account: {
      id: row.account_id,
      email: row.username
    },
    proxy: row.proxy_id ? {
      id: row.proxy_id,
      host: row.proxy_host,
      port: row.proxy_port
    } : null
  }));
}

export async function addAuthCookie(cookie: Omit<AuthCookie, 'id' | 'date_generated'>): Promise<AuthCookie> {
  const { proxy_id, account_id, cookie_url } = cookie;

  const result: QueryResult<AuthCookie> = await pool.query(
    `INSERT INTO authcookies (proxy_id, account_id, cookie_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [proxy_id, account_id, cookie_url]
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to insert auth cookie');
  }

  return result.rows[0];
}

export async function getAuthCookieById(id: number): Promise<AuthCookie | null> {
  const result: QueryResult<AuthCookie> = await pool.query(
    'SELECT * FROM authcookies WHERE id = $1',
    [id]
  );

  return result.rows[0] ?? null;
}

export async function deleteAuthCookie(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM authcookies WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
