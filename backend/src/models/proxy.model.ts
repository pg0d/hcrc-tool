import { pool } from '../db';
import type { QueryResult } from 'pg';

type Proxy = {
  id: number;
  host: string;
  port: number;
  username: string;
  password: string;
  created_at?: string;
};

export async function addProxy(proxy: Omit<Proxy, 'id'>): Promise<Proxy> {
  const { host, port, username, password } = proxy;

  const result: QueryResult<Proxy> = await pool.query(
    `INSERT INTO proxies (host, port, username, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [host, port, username, password]
  );

  if (result.rows.length == 0) {
    throw new Error('Failed to insert proxy');
  }

  return result.rows[0];
}

export async function getAllProxies(): Promise<Proxy[]> {
  const result: QueryResult<Proxy> = await pool.query('SELECT * FROM proxies');
  return result.rows;
}

export async function getProxyById(id: number): Promise<Proxy | null> {
  const result: QueryResult<Proxy> = await pool.query('SELECT * FROM proxies WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function deleteProxy(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM proxies WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function updateProxy(id: number, data: Partial<Omit<Proxy, 'id'>>): Promise<boolean> {
  const { host, port, username, password } = data;

  const result = await pool.query(
    `UPDATE proxies
     SET host = COALESCE($1, host),
         port = COALESCE($2, port),
         username = COALESCE($3, username),
         password = COALESCE($4, password)
     WHERE id = $5`,
    [host, port, username, password, id]
  );

  return (result.rowCount ?? 0) > 0;
}
