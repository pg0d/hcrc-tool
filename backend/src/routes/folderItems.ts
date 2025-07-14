// routes/folderItems.ts
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/', (req, res) => {
  const dir = path.resolve('uploads');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list uploads' });

    const filtered = files.filter(f => f.endsWith('.csv') || f.endsWith('.xlsx'));
    res.json(filtered);
  });
});

export default router;
