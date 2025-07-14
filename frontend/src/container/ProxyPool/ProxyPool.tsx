import { createSignal, createResource, For, Show } from 'solid-js';

type Proxy = {
  id: number;
  host: string;
  port: number;
  username: string;
  password: string;
  created_at: string;
};

const fetchProxies = async (): Promise<Proxy[]> => {
  const res = await fetch('http://localhost:5000/api/proxies');
  if (!res.ok) throw new Error('Failed to fetch proxies');
  return res.json();
};

export default function ProxyPool() {
  const [proxies, { refetch }] = createResource(fetchProxies);

  const [newHost, setNewHost] = createSignal('');
  const [newPort, setNewPort] = createSignal('');
  const [newUsername, setNewUsername] = createSignal('');
  const [newPassword, setNewPassword] = createSignal('');

  const [editingId, setEditingId] = createSignal<number | null>(null);
  const [editHost, setEditHost] = createSignal('');
  const [editPort, setEditPort] = createSignal('');
  const [editUsername, setEditUsername] = createSignal('');
  const [editPassword, setEditPassword] = createSignal('');

  const addProxy = async () => {
    const body = {
      host: newHost(),
      port: parseInt(newPort(), 10),
      username: newUsername(),
      password: newPassword()
    };

    await fetch('http://localhost:5000/api/proxies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    setNewHost('');
    setNewPort('');
    setNewUsername('');
    setNewPassword('');
    refetch();
  };

  const deleteProxy = async (id: number) => {
    await fetch(`http://localhost:5000/api/proxies/${id}`, {
      method: 'DELETE'
    });
    refetch();
  };

  const startEditing = (proxy: Proxy) => {
    setEditingId(proxy.id);
    setEditHost(proxy.host);
    setEditPort(String(proxy.port));
    setEditUsername(proxy.username);
    setEditPassword(proxy.password);
  };

  const saveEdit = async () => {
    const id = editingId();
    if (!id) return;

    await fetch(`http://localhost:5000/api/proxies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: editHost(),
        port: parseInt(editPort(), 10),
        username: editUsername(),
        password: editPassword()
      })
    });

    setEditingId(null);
    refetch();
  };

  return (
    <div class="proxy-pool">
      <h2>Proxy Pool</h2>

      <div class="proxy-form">
        <input
          type="text"
          placeholder="Host"
          value={newHost()}
          onInput={(e) => setNewHost(e.currentTarget.value)}
        />
        <input
          type="number"
          placeholder="Port"
          value={newPort()}
          onInput={(e) => setNewPort(e.currentTarget.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={newUsername()}
          onInput={(e) => setNewUsername(e.currentTarget.value)}
        />
        <input
          type="text"
          placeholder="Password"
          value={newPassword()}
          onInput={(e) => setNewPassword(e.currentTarget.value)}
        />
        <button onClick={addProxy}>Add Proxy</button>
      </div>

      <Show when={proxies()} fallback={<p>Loading proxies...</p>}>
        <ul class="proxy-list">
          <For each={proxies()}>
            {(proxy) => (
              <li class="proxy-item">
                <Show
                  when={editingId() === proxy.id}
                  fallback={
                    <>
                      <span>
                        <strong>{proxy.host}:{proxy.port}</strong> — {proxy.username}
                      </span>
                      <button onClick={() => startEditing(proxy)}>Edit</button>
                      <button onClick={() => deleteProxy(proxy.id)}>Delete</button>
                    </>
                  }
                >
                  <>
                    <input
                      type="text"
                      value={editHost()}
                      onInput={(e) => setEditHost(e.currentTarget.value)}
                    />
                    <input
                      type="number"
                      value={editPort()}
                      onInput={(e) => setEditPort(e.currentTarget.value)}
                    />
                    <input
                      type="text"
                      value={editUsername()}
                      onInput={(e) => setEditUsername(e.currentTarget.value)}
                    />
                    <input
                      type="text"
                      value={editPassword()}
                      onInput={(e) => setEditPassword(e.currentTarget.value)}
                    />
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
