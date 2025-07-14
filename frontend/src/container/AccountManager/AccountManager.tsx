import { createSignal, createResource, For, Show } from 'solid-js';
import './AccountManager.css';

type Account = {
  id: number;
  service: string;
  cookies: string;
  username: string;
  password: string;
  created_at: string;
};

const fetchAccounts = async (): Promise<Account[]> => {
  const res = await fetch('http://localhost:5000/api/accounts');
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return res.json();
};

export default function AccountManager() {
  const [accounts, { refetch }] = createResource(fetchAccounts);

  const [newUsername, setNewUsername] = createSignal('');
  const [newPassword, setNewPassword] = createSignal('');
  const [editingId, setEditingId] = createSignal<number | null>(null);
  const [editUsername, setEditUsername] = createSignal('');
  const [editPassword, setEditPassword] = createSignal('');

  const addAccount = async () => {
    const body = {
      service: 'linkedin',
      username: newUsername(),
      password: newPassword(),
      cookies: ''
    };
    await fetch('http://localhost:5000/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setNewUsername('');
    setNewPassword('');
    refetch();
  };

  const deleteAccount = async (id: number) => {
    await fetch(`http://localhost:5000/api/accounts/${id}`, {
      method: 'DELETE'
    });
    refetch();
  };

  const startEditing = (acc: Account) => {
    setEditingId(acc.id);
    setEditUsername(acc.username);
    setEditPassword(acc.password);
  };

  const saveEdit = async () => {
    await fetch(`http://localhost:5000/api/accounts/${editingId()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: editUsername(),
        password: editPassword()
      })
    });
    setEditingId(null);
    refetch();
  };

  return (
    <div class="account-manager">
      <h2>Account Manager</h2>

      <div class="account-form">
        <input
          type="text"
          placeholder="Username"
          value={newUsername()}
          onInput={(e) => setNewUsername(e.currentTarget.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={newPassword()}
          onInput={(e) => setNewPassword(e.currentTarget.value)}
        />
        <button onClick={addAccount}>Add Account</button>
      </div>

      <Show when={accounts()} fallback={<p>Loading accounts...</p>}>
        <ul class="account-list">
          <For each={accounts()}>
            {(acc) => (
              <li class="account-item">
                <Show
                  when={editingId() === acc.id}
                  fallback={
                    <>
                      <strong>{acc.username}</strong> — {acc.service}
                      <button onClick={() => startEditing(acc)}>Edit</button>
                      <button onClick={() => deleteAccount(acc.id)}>Delete</button>
                    </>
                  }
                >
                  <>
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
