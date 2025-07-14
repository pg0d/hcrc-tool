import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { crawlLinkedInProfilesFromSheet } from '../crawler/linkedin';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req: any, res: any) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const ext = path.extname(file.originalname);
  const newFilename = `${file.filename}${ext}`;
  const oldPath = path.resolve(file.path);
  const newPath = path.resolve('uploads', newFilename);

  try {
    await fs.rename(oldPath, newPath);
    res.json({
      success: true,
      filename: newFilename,
    });
  } catch {
    res.status(500).json({ error: 'Failed to rename uploaded file' });
  }
});

router.get('/linkedin', async (req: any, res: any) => {
  const filename = req.query.file;
  const limit = Number(req.query.limit ?? 400);
  const settings = req.query.settings ? [].concat(req.query.settings) : [];

  const cookieFile = req.query.cookieFile;
  const proxyId = parseInt(req.query.proxyId, 10);
  const accountId = parseInt(req.query.accountId, 10);

  if (!filename) {
    return res.status(400).end('Missing file parameter');
  }

  const filePath = path.resolve('uploads', filename.toString());

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (msg: string) => res.write(`data: ${msg}\n\n`);

  const sendStats = (stats: any) => {
    res.write(`event: stats\n`);
    res.write(`data: ${JSON.stringify(stats)}\n\n`);
  };

  try {
    await crawlLinkedInProfilesFromSheet(
      filePath,
      limit,
      sendLog,
      sendStats,
      settings,
      cookieFile,
      proxyId,
      accountId
    );

    res.write(`event: done\ndata: all_done\n\n`);
  } catch (err: any) {
    sendLog(`❌ Error: ${err.message}`);
  }

  res.end();
  req.on('close', () => res.end());
});


export default router;
