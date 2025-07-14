import express from 'express';
import {
  getProxyById,
  getAllProxies,
  addProxy,
  deleteProxy
} from '../models/proxy.model';

const router = express.Router();

// GET /api/proxies
router.get('/', async (req, res) => {
  const proxies = await getAllProxies();
  res.json(proxies);
});

// GET /api/proxies/:id
router.get('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const proxy = await getProxyById(id);
  if (!proxy) return res.status(404).json({ message: 'Proxy not found' });
  res.json(proxy);
});

// POST /api/proxies
router.post('/', async (req: any, res: any) => {
  const { host, port, username, password } = req.body;

  if (!host || !port) {
    return res.status(400).json({ message: 'Missing required fields: host and port' });
  }

  const id = await addProxy({ host, port, username, password });
  res.status(201).json(id);
});

// DELETE /api/proxies
router.delete('/:id', async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const success = await deleteProxy(id);
  if (!success) {
    return res.status(404).json({ message: 'Proxy not found or already deleted' });
  }
  res.status(204).send();
});

export default router;
