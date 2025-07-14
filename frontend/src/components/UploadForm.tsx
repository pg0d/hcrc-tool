import { createSignal, For } from 'solid-js';
import FileUpload from './FileUpload/FileUpload';
import AccountManager from './AccountManager';


type CrawlStats = {
  total: number;
  crawled: number;
  errors: number;
};

export default function UploadForm() {

  const [file, setFile] = createSignal<File | null>(null);
  const [userId, setUserId] = createSignal('1');
  const [limit, setLimit] = createSignal('400');
  const [status, setStatus] = createSignal('');
  const [logs, setLogs] = createSignal<string[]>([]);
  const [isCrawling, setIsCrawling] = createSignal(false);

  const [stats, setStats] = createSignal<CrawlStats>({
    total: 0,
    crawled: 0,
    errors: 0,
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!file()) {
      setStatus('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file()!);
    formData.append('userId', userId());
    formData.append('limit', limit());

    setStatus('📤 Uploading...');
    setLogs([]);

    try {
      const res = await fetch('http://localhost:5000/api/crawl/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.filename) {
        throw new Error(data.error || 'Upload failed');
      }

      setStatus('✅ Upload successful! Starting crawl...');
      startCrawl(data.filename);
    } catch (err: any) {
      setStatus(`❌ Upload failed: ${err.message}`);
    }
  };

  const startCrawl = (filename: string) => {
    setIsCrawling(true);
    const params = new URLSearchParams({
      file: filename,
      userId: userId(),
      limit: limit(),
    });

    const source = new EventSource(`http://localhost:5000/api/crawl/linkedin?${params.toString()}`);

    source.addEventListener('message', (e) => {
      setLogs((prev) => [...prev, e.data]);
      if (e.data.includes('✅ Done crawling')) {
        setStatus('✅ Done crawling');
        source.close();
        setIsCrawling(false);
      }
    });

    source.addEventListener('stats', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        setStats(parsed);
      } catch {
        console.warn('Failed to parse stats:', e.data);
      }
    });

    source.onerror = () => {
      setStatus('❌ Connection lost or error occurred');
      source.close();
      setIsCrawling(false);
    };
  };

  const accounts = [
    { id: 1, email: 'enan.andrew.9@gmail.com', status: 'Active' },
    { id: 2, email: 'john.doe@example.com', status: 'Active' },
    { id: 3, email: 'mike.wilson@example.com', status: 'Active' },
  ];

  return (
    <section class="main-content">
      <form onSubmit={handleSubmit}>
        <FileUpload onFileSelect={setFile} />

        <AccountManager accounts={accounts} onSelect={(acc) => console.log('Selected:', acc)} />
          
        <button type="submit" disabled={isCrawling()}>
          {isCrawling() ? 'Crawling...' : 'Upload and Crawl'}
        </button>

        <p>{status()}</p>

      </form>

      <div>
        <h3>Crawl Statistics</h3>
        <ul class="crawl-stats">
          <li><strong>Total</strong> <div class="stats-number">{stats().total}</div></li>
          <li><strong>Crawled</strong> <div class="stats-number">{stats().crawled}</div></li>
          <li><strong>Errors</strong> <div class="stats-number">{stats().errors}</div></li>
        </ul>
        <div class="console-log">
          <For each={logs()}>
            {(log) => <div class="log-line">$: &gt; {log}</div>}
          </For>
          {isCrawling() && <div class="log-line cursor">$: &gt; _</div>}
        </div>
      </div>
    </section>
  );
}
