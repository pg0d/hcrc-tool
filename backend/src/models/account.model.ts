// models/account.model.ts
// import { initDb, Account } from '../db';

import { pool } from '../db';
import type { QueryResult } from 'pg';

type Account = {
  id: number;
  service: string;
  cookies: string;
  username: string;
  password: string;
  created_at?: string;
};

export async function getAllAccounts(): Promise<Account[]> {
  const result: QueryResult<Account> = await pool.query('SELECT * from accounts');
  return result.rows;
};

export async function addAccount(account: Omit<Account, 'id'>): Promise<Account> {
  const { service, cookies, username, password } = account;

  const result: QueryResult<Account> = await pool.query(
    `INSERT INTO accounts (service, cookies, username, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [service, cookies, username, password]
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to insert account');
  }

  return result.rows[0];
}

export async function getAccountById(id: number): Promise<Account | null> {
  const result: QueryResult<Account> = await pool.query(
    'SELECT * FROM accounts WHERE id = $1',
    [id]
  );

  return result.rows[0] ?? null;
}

export async function deleteAccount(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM accounts WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function updateAccount(id: number, data: Partial<Omit<Account, 'id'>>): Promise<boolean> {
  const { service, cookies, username, password } = data;

  const result = await pool.query(
    `UPDATE accounts
     SET service = COALESCE($1, service),
         cookies = COALESCE($2, cookies),
         username = COALESCE($3, username),
         password = COALESCE($4, password)
     WHERE id = $5`,
    [service, cookies, username, password, id]
  );

  return (result.rowCount ?? 0) > 0;
}
