// routes/logStream.ts
import express from 'express';
export const logRouter = express.Router();

logRouter.get('/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (msg: string) => res.write(`data: ${msg}\n\n`);

  // Simulate log stream — replace this with actual calls from your crawler
  send('Crawler started...');
  let i = 0;
  const interval = setInterval(() => {
    i++;
    send(`Visited profile ${i}`);
    if (i >= 5) {
      send('Finished!');
      clearInterval(interval);
      res.end();
    }
  }, 1000);

  req.on('close', () => clearInterval(interval));
});
