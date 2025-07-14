import { createSignal, For, Show, createEffect, createResource } from 'solid-js';
import "./Content.css";

import FileUpload from '../components/FileUpload/FileUpload';
import { ItemList } from '../components/ItemLists/ItemList';
import { ProfileVariantPills } from '../components/ProfileVariantPills/ProfileVariantPills';
import { AdditionalSettings } from '../components/AdditionalSettings/AdditionalSettings';
import { Button } from '../components/Buttons/Button';
import type { ListItem } from '../components/ItemLists/ItemList';

import { Switch, Match } from 'solid-js';

import AccountManager from './AccountManager/AccountManager';
import ProxyPool from './ProxyPool/ProxyPool';
import AuthGenerator from './AuthGenerator/AuthGenerator';
import ExportDataContainer from './ExportData/ExportData';

type CrawlStats = {
  total: number;
  crawled: number;
  errors: number;
};

const fetchAuthCookies = async (): Promise<ListItem[]> => {
  const response = await fetch('http://localhost:5000/api/authcookies/');
  if (!response.ok) throw new Error('Failed to fetch data');
  return await response.json();
};

const fetchUploadedFiles = async (): Promise<string[]> => {
  const res = await fetch('http://localhost:5000/api/uploads');
  if (!res.ok) throw new Error('Failed to fetch uploaded files');
  return await res.json();
};

export default function Content(props: { selectedTool: () => string }) {

  const [file, setFile] = createSignal<File | null>(null);
  const [limit, setLimit] = createSignal("400");
  const [status, setStatus] = createSignal("");
  const [logs, setLogs] = createSignal<string[]>([]);
  const [isCrawling, setIsCrawling] = createSignal(false);
  const [stats, setStats] = createSignal<CrawlStats>({ total: 0, crawled: 0, errors: 0 });

  const [additionalSettings, setAdditionalSettings] = createSignal<string[]>([]);

  const [uploadedFiles] = createResource(fetchUploadedFiles);
  const [selectedFilename, setSelectedFilename] = createSignal<string | null>(null);
  const [crawlFinished, setCrawlFinished] = createSignal(false);

  const [authCookies] = createResource(fetchAuthCookies);

  let logContainerRef: HTMLDivElement | undefined;

  createEffect(() => {
    logs();
    if (logContainerRef) {
      logContainerRef.scrollTop = logContainerRef.scrollHeight;
    }
  });

  const handleSubmit = async () => {
    const fileVal = file();
    const cookieVal = authCookies();
    const limitVal = limit();
    const settings = additionalSettings();

    if ((!fileVal && !selectedFilename()) || !cookieVal || !limitVal || settings.length === 0) {
      alert("❌ Please fill out all required fields:\n- File or Existing File\n- Login Cookie\n- Limit\n- At least one Additional Setting");
      return;
    }

    setLogs([]);
    setStatus("📤 Preparing...");

    let filename = selectedFilename();

    if (!filename && fileVal) {
      const formData = new FormData();
      formData.append("file", fileVal);

      const res = await fetch("http://localhost:5000/api/crawl/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.filename) {
        setStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
        return;
      }

      filename = data.filename;
    }

    setStatus("Starting crawl...");

    const selectedCookie = cookieVal[0];

    startCrawl(
      filename!,
      { cookie_url: selectedCookie.cookie_url },
      { id: selectedCookie.proxy.id },
      { id: selectedCookie.account.id },
      settings,
      Number(limitVal)
    );

  };

  const startCrawl = (
    filename: string,
    cookie: { cookie_url: string },
    proxy: { id: number; },
    account: { id: number; },
    settings: string[],
    limit: number
  ) => {

    setIsCrawling(true);
    const params = new URLSearchParams({
      file: filename,
      limit: limit.toString(),
      cookieFile: cookie.cookie_url,
      proxyId: proxy.id.toString(),
      accountId: account.id.toString(),
    });

    settings.forEach((s) => params.append("settings", s));

    const source = new EventSource(`http://localhost:5000/api/crawl/linkedin?${params.toString()}`);

    source.addEventListener("message", (e) => {
      setLogs((prev) => [...prev, e.data]);
    });

    source.addEventListener("stats", (e) => {
      try {
        setStats(JSON.parse(e.data));
      } catch {
        console.warn("⚠️ Invalid stats format:", e.data);
      }
    });

    source.addEventListener("done", () => {
      setStatus("✅ Crawl and save complete");
      setCrawlFinished(true);
      source.close();
    });

    source.onerror = () => {
      setStatus("❌ Connection lost or error occurred");
      setCrawlFinished(true);
      source.close();
    };
  };

  return (
    <section class="main-content">
      <Switch fallback={<p>⚠️ Unknown Tool Selected</p>}>
        <Match when={props.selectedTool() === 'crawler'}>
          <Show when={!isCrawling()} fallback={
            <div class="crawl-progress">

              <h3 class="progress-message">Crawling in progress...</h3>
              <div class="console-log" ref={logContainerRef}>
                <For each={logs()}>{(log) => <div class="log-line">$: &gt; {log}</div>}</For>
                <Show when={isCrawling()}><div class="log-line cursor">$: &gt; </div></Show>
              </div>

              <ul class="crawl-stats">
                <li><strong>Total:</strong> {stats().total}</li>
                <li><strong>Success:</strong> {stats().crawled}</li>
                <li><strong>Errors:</strong> {stats().errors}</li>
              </ul>

              <Show when={crawlFinished()}>
                <Button type="button" onClick={() => {
                  setIsCrawling(false);
                  setCrawlFinished(false); // Reset
                }}>
                  ✅ Continue
                </Button>
              </Show>
            </div>
          }>
            <div class="content-settings">

              <div class="content-item">
                <h3 class="heading">Choose a File to Crawl:</h3>
                <FileUpload onFileSelect={setFile} />
                <div class="content-item">
                  <h3 class="heading">Or Select a Previously Uploaded File:</h3>
                  <Show when={uploadedFiles()}>
                    <select onChange={(e) => setSelectedFilename(e.currentTarget.value)}>
                      <option value="">-- Select a file --</option>
                      <For each={uploadedFiles()}>
                        {(f) => <option value={f}>{f}</option>}
                      </For>
                    </select>
                  </Show>
                </div>
              </div>

              <div class="content-item">
                <h3 class="heading">Pick Existing Login Cookies (Users):</h3>
                {authCookies() && (
                  <ItemList items={authCookies()!} onSelect={(item) => console.log('Selected:', item)} />
                )}
              </div>

              <div class="content-item">
                <h3 class="heading">Set Limit Crawl:</h3>
                <ProfileVariantPills options={[30, 50, 70, 80, 100]} onSelect={(val) => setLimit(String(val))} />
              </div>

              <div class="content-item">
                <h3 class="heading">Additional Settings:</h3>
                <AdditionalSettings
                  options={['Headless Mode', 'Block Images']}
                  onChange={(selected) => setAdditionalSettings(selected)}
                />
              </div>

              <Button variant="primary" type="button" onClick={handleSubmit}>
                Start Crawling
              </Button>

              <div class="stats">{status()}</div>
            </div>
          </Show>
        </Match>

        <Match when={props.selectedTool() === 'auth'}>
          <AuthGenerator />
        </Match>

        <Match when={props.selectedTool() === 'account'}>
          <AccountManager />
        </Match>

        <Match when={props.selectedTool() === 'proxy'}>
          <ProxyPool />
        </Match>

        <Match when={props.selectedTool() === 'export-data'}>
          <ExportDataContainer />
        </Match>

      </Switch>
    </section >
  );
}
