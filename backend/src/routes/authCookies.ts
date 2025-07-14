import express from 'express';
import {
  getAllAuthCookies,
  getAuthCookieById,
  addAuthCookie,
  deleteAuthCookie
} from '../models/authcookies.model';

const router = express.Router();

// GET /api/authcookies
router.get('/', async (req, res) => {
  try {
    const cookies = await getAllAuthCookies();
    res.json(cookies);
  } catch (err) {
    console.error('Error fetching cookies:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/authcookies/:id
router.get('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    const cookie = await getAuthCookieById(id);
    if (!cookie) return res.status(404).json({ message: 'Cookie not found' });
    res.json(cookie);
  } catch (err) {
    console.error('Error fetching cookie:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/authcookies
router.post('/', async (req: any, res: any) => {
  const { proxy_id, account_id, cookie_url } = req.body;

  if (!account_id || !cookie_url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newCookie = await addAuthCookie({ proxy_id, account_id, cookie_url });
    res.status(201).json(newCookie);
  } catch (err) {
    console.error('Error adding cookie:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/authcookies/:id
router.delete('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    const success = await deleteAuthCookie(id);
    if (!success) {
      return res.status(404).json({ message: 'Cookie not found or already deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting cookie:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
