import express from 'express';
import {
  getAllAccounts,
  addAccount,
  deleteAccount,
  updateAccount,
  getAccountById
} from '../models/account.model';

import generateAuthCookies from '../generate/generateAuthCookies';

const router = express.Router();

// GET /api/accounts
router.get('/', async (req: any, res: any) => {
  const account = await getAllAccounts();
  if (!account) return res.status(404).json({ message: 'Account not found' });
  res.json(account);
});

// GET /api/accounts/:id
router.get('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const account = await getAccountById(id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/accounts
router.post('/', async (req: any, res: any) => {
  try {
    const { service, cookies = '', username, password } = req.body;

    if (!service || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const account = await addAccount({ service, cookies, username, password });

    res.status(201).json(account);

  } catch (error) {
    console.error('Error adding account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/accounts
router.delete('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const success = await deleteAccount(id);
  if (!success) {
    return res.status(404).json({ message: 'Account not found or already deleted' });
  }
  res.status(204).send();
});

// PUT /api/accounts
router.put('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const updated = await updateAccount(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Account not found' });
  res.status(200).json({ message: 'Account updated' });
});

// POST /api/accounts/generate-cookies/
router.post('/generate-cookies', async (req: any, res: any) => {
  const settings = req.body;

  if (
    !settings.userId ||
    !settings.proxyId ||
    !settings.target ||
    !settings.target.loginUrl ||
    !settings.target.userNameSelector ||
    !settings.target.passwordSelector ||
    !settings.target.submitSelector
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await generateAuthCookies(settings);
    console.log(result);
    return res.status(200).json({
      message: 'Cookies generated successfully'
    });
  } catch (err) {
    console.error('Error generating cookies:', err);
    return res.status(500).json({ message: 'Failed to generate cookies' });
  }
});

export default router;