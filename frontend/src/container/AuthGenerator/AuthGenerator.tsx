import { createSignal, createResource, For } from 'solid-js';
import './AuthGenerator.css';

type Account = {
  id: number;
  username: string;
};

type Proxy = {
  id: number;
  host: string;
  port: number;
};

type InitSettings = {
  userId: number;
  proxyId: number;
  target: {
    loginUrl: string;
    userNameSelector: string;
    passwordSelector: string;
    submitSelector: string;
  };
};

const fetchAccounts = async (): Promise<Account[]> => {
  const res = await fetch('http://localhost:5000/api/accounts');
  return res.json();
};

const fetchProxies = async (): Promise<Proxy[]> => {
  const res = await fetch('http://localhost:5000/api/proxies');
  return res.json();
};

export default function AuthGenerator() {
  const [accounts] = createResource(fetchAccounts);
  const [proxies] = createResource(fetchProxies);

  const [selectedAccount, setSelectedAccount] = createSignal<number | null>(null);
  const [selectedProxy, setSelectedProxy] = createSignal<number | null>(null);
  const [loginUrl, setLoginUrl] = createSignal('');
  const [usernameSel, setUsernameSel] = createSignal('');
  const [passwordSel, setPasswordSel] = createSignal('');
  const [submitSel, setSubmitSel] = createSignal('');

  const handleSubmit = async () => {
    if (!selectedAccount() || !selectedProxy()) {
      alert('Please select an account and a proxy.');
      return;
    }

    const payload: InitSettings = {
      userId: selectedAccount()!,
      proxyId: selectedProxy()!,
      target: {
        loginUrl: loginUrl(),
        userNameSelector: usernameSel(),
        passwordSelector: passwordSel(),
        submitSelector: submitSel()
      }
    };

    console.log('Submitting auth config:', payload);

    await fetch("http://localhost:5000/api/accounts/generate-cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  };

  return (
    <div class="auth-generator">
      <h2>Auth Generator</h2>

      {/* Account Selector */}
      <div>
        <label>Choose Account:</label>
        <select onChange={(e) => setSelectedAccount(parseInt(e.currentTarget.value, 10))}>
          <option value="">-- Select Account --</option>
          <For each={accounts()}>
            {(acc) => <option value={acc.id}>{acc.username}</option>}
          </For>
        </select>
      </div>

      {/* Proxy Selector */}
      <div>
        <label>Choose Proxy:</label>
        <select onChange={(e) => setSelectedProxy(parseInt(e.currentTarget.value, 10))}>
          <option value="">-- Select Proxy --</option>
          <For each={proxies()}>
            {(proxy) => (
              <option value={proxy.id}>
                {proxy.host}:{proxy.port}
              </option>
            )}
          </For>
        </select>
      </div>

      {/* Target Form */}
      <div>
        <label>Login URL:</label>
        <input type="text" value={loginUrl()} onInput={(e) => setLoginUrl(e.currentTarget.value)} />

        <label>Username Selector:</label>
        <input type="text" value={usernameSel()} onInput={(e) => setUsernameSel(e.currentTarget.value)} />

        <label>Password Selector:</label>
        <input type="text" value={passwordSel()} onInput={(e) => setPasswordSel(e.currentTarget.value)} />

        <label>Submit Selector:</label>
        <input type="text" value={submitSel()} onInput={(e) => setSubmitSel(e.currentTarget.value)} />
      </div>

      <button onClick={handleSubmit}>Generate Auth</button>
    </div>
  );
}
