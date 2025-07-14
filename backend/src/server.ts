import express, { application } from 'express';
import crawlRoute from './routes/crawl';
import accountRoute from './routes/account';
import proxyRoute from './routes/proxy';
import { logRouter } from './routes/logStream';
import authCookiesRoute from './routes/authCookies';
import folderItems from './routes/folderItems';
import profileRoutes from './routes/profiles';

import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || '*');
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/crawl', crawlRoute);
app.use('/api/accounts', accountRoute);
app.use('/api/proxies', proxyRoute);
app.use('/api/', logRouter);

app.use('/api/authcookies', authCookiesRoute);

app.use('/api/uploads', folderItems);
app.use('/api/profiles', profileRoutes);


app.get('/', (req, res) => {
  res.status(201).json({ message: 'Silence is golden' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
