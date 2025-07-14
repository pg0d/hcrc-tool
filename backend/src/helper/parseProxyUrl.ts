export default function parseProxyURL(proxyUrl: string | null) {
  if (!proxyUrl) {
    console.error('Proxy URL is null or undefined.');
    return null;
  }

  try {
    const url = new URL(proxyUrl);
    const host = url.hostname;
    const port = url.port;
    const username = url.username || undefined;
    const password = url.password || undefined;
    const server = `${host}:${port}`;
    return { server, username, password };
  } catch (err) {
    console.error(`Invalid proxy format: ${proxyUrl}`);
    return null;
  }
}