import React, { useState, useEffect } from 'react';

const KEYS = {
  growwApiKey: 'its_groww_api_key',
  growwSecret: 'its_groww_secret',
  paperCapital: 'its_paper_capital',
  phase: 'its_phase',
};

function load(k, fallback) {
  try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function MaskedInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: 44, fontFamily: value ? 'var(--font-mono)' : 'inherit', fontSize: value ? 12 : 13 }}
      />
      <button
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: '2px 4px' }}
      >{show ? '🙈' : '👁'}</button>
    </div>
  );
}

function StatusDot({ status }) {
  const colors = { connected: 'var(--green)', saved: 'var(--accent)', empty: 'var(--text3)' };
  const labels = { connected: 'Connected', saved: 'Saved (not verified)', empty: 'Not set' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[status] }} />
      <span style={{ fontSize: 11, color: colors[status], fontFamily: 'var(--font-mono)' }}>{labels[status]}</span>
    </div>
  );
}

export default function Settings() {
  const [growwKey, setGrowwKey] = useState(load(KEYS.growwApiKey, ''));
  const [growwSecret, setGrowwSecret] = useState(load(KEYS.growwSecret, ''));
  const [capital, setCapital] = useState(load(KEYS.paperCapital, 100000));
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    save(KEYS.growwApiKey, growwKey);
    save(KEYS.growwSecret, growwSecret);
    save(KEYS.paperCapital, capital);
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = (field) => {
    if (field === 'key') { setGrowwKey(''); save(KEYS.growwApiKey, ''); }
    if (field === 'secret') { setGrowwSecret(''); save(KEYS.growwSecret, ''); }
    setTestResult(null);
  };

  // Simulate API test (real test will be wired in Phase 2)
  const handleTest = () => {
    if (!growwKey) { setTestResult({ ok: false, msg: 'Please enter your API key first.' }); return; }
    setTesting(true); setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      // Key format check — Groww keys are typically long alphanumeric strings
      if (growwKey.length < 20) {
        setTestResult({ ok: false, msg: 'Key looks too short. Groww API keys are usually 40+ characters. Double-check what you copied.' });
      } else {
        setTestResult({ ok: true, msg: 'Key saved and format looks valid. Live verification will be wired in Phase 2 when we connect the Groww API to the app.' });
      }
      save(KEYS.growwApiKey, growwKey);
      save(KEYS.growwSecret, growwSecret);
    }, 1200);
  };

  const keyStatus = growwKey.length > 20 ? 'saved' : 'empty';

  return (
    <>
      <div className="page-header">
        <h2>Settings</h2>
        <p>API keys, paper capital, and system configuration</p>
      </div>
      <div className="page-content">

        {/* Groww API */}
        <div className="card" style={{ borderColor: growwKey ? 'rgba(240,180,41,0.3)' : 'var(--border)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🔑 Groww API Credentials</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Required for Phase 2 — live market data and order placement</div>
            </div>
            <StatusDot status={keyStatus} />
          </div>

          {/* What each field means */}
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px', marginBottom: 18, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>What you need — from Groww Cloud</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { field: 'API Key', where: 'groww.in/trade-api → Cloud → API Keys → Generate Key', use: 'Identifies your account to the API' },
                { field: 'API Secret', where: 'Same page, shown once when you generate the key', use: 'Signs your requests securely. Save it immediately — Groww shows it only once.' },
              ].map(r => (
                <div key={r.field} style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', flexShrink: 0, width: 80, fontWeight: 600 }}>{r.field}</span>
                  <div>
                    <div style={{ color: 'var(--text2)' }}>{r.use}</div>
                    <div style={{ color: 'var(--text3)', marginTop: 2, fontSize: 11 }}>📍 {r.where}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">API Key</label>
            <MaskedInput value={growwKey} onChange={setGrowwKey} placeholder="Paste your Groww API key here" />
            {growwKey && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{growwKey.length} characters</span>
              <button onClick={() => handleClear('key')} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
            </div>}
          </div>

          <div className="form-group">
            <label className="form-label">API Secret <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 400, marginLeft: 6 }}>— shown only once by Groww, save it here immediately</span></label>
            <MaskedInput value={growwSecret} onChange={setGrowwSecret} placeholder="Paste your Groww API secret here" />
            {growwSecret && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{growwSecret.length} characters</span>
              <button onClick={() => handleClear('secret')} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
            </div>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Credentials'}
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleTest} disabled={testing}>
              {testing ? '◌ Testing...' : '⚡ Verify Key'}
            </button>
          </div>

          {testResult && (
            <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 7, background: testResult.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: 13, color: testResult.ok ? 'var(--green)' : 'var(--red)', lineHeight: 1.5 }}>
              {testResult.ok ? '✓' : '✗'} {testResult.msg}
            </div>
          )}
        </div>

        {/* Paper Capital */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>💰 Paper Trading Capital</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 18 }}>This is your simulated starting balance. Changing this resets your displayed capital — it does not affect logged trades.</div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Starting Capital ₹</label>
            <input className="form-input" type="number" step="10000" min="10000" value={capital} onChange={e => setCapital(+e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[50000, 100000, 200000, 500000].map(amt => (
              <button key={amt} onClick={() => setCapital(amt)} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${capital === amt ? 'var(--accent)' : 'var(--border)'}`, background: capital === amt ? 'rgba(240,180,41,0.1)' : 'var(--bg3)', color: capital === amt ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                ₹{(amt / 1000)}K
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{saved ? '✓ Saved!' : 'Save'}</button>
        </div>

        {/* Phase roadmap */}
        <div className="card" style={{ borderColor: 'rgba(240,180,41,0.2)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>🗺️ API Integration Roadmap</div>
          {[
            { phase: 'Phase 1', label: 'Now', title: 'Paper Trading Foundation', desc: 'Journal, Backtester, Screener, Knowledge — all running. Groww API key saved and ready.', done: true },
            { phase: 'Phase 2', label: 'Next', title: 'Live Data via Groww API', desc: 'Wire your saved API key to fetch real-time prices, your actual holdings, and live P&L into the dashboard.', done: false },
            { phase: 'Phase 3', label: 'Later', title: 'Automated Screener + Alerts', desc: 'Daily screener runs automatically using live data. Notifies you of trade setups matching your strategy.', done: false },
            { phase: 'Phase 4', label: 'Final', title: 'Paper → Real Money', desc: 'After 20+ paper trades with positive expectancy, optionally enable real order placement via Groww API.', done: false },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
              <div style={{ textAlign: 'center', flexShrink: 0, width: 64 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: r.done ? 'var(--green)' : 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{r.phase}</div>
                <div style={{ fontSize: 10, color: r.done ? 'var(--green)' : 'var(--accent)', marginTop: 2, fontWeight: 600 }}>{r.label}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</span>
                  {r.done && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>✓ Active</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.55 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Security note */}
        <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 6 }}>Security Note</div>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Your API key is stored only in <strong>your browser's localStorage</strong> — it never leaves your device and is never sent to any server. This app has no backend. However, treat your API key like a password: don't share screenshots of this page with the key visible, and regenerate the key immediately from Groww if you suspect it was exposed.
          </p>
        </div>

      </div>
    </>
  );
}
