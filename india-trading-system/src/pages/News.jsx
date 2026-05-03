import React, { useState, useEffect } from 'react';
import { store } from '../data/store';

const CATEGORIES = ['All', 'Macro', 'Earnings', 'Global', 'FII/DII', 'Sector', 'RBI/SEBI', 'Budget'];
const IMPACTS = ['Bullish', 'Bearish', 'Neutral'];
const SECTORS = ['All Sectors', 'Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 'Energy', 'Infra', 'Metal', 'Real Estate', 'Telecom'];

const IMPACT_COLORS = { Bullish: 'var(--green)', Bearish: 'var(--red)', Neutral: 'var(--accent)' };
const IMPACT_BG = { Bullish: 'rgba(34,197,94,0.1)', Bearish: 'rgba(239,68,68,0.1)', Neutral: 'rgba(240,180,41,0.1)' };

const EMPTY_NEWS = {
  date: new Date().toISOString().split('T')[0],
  title: '', category: 'Macro', impact: 'Neutral',
  summary: '', affectedSectors: [], tradeImpact: '', source: '',
};

function NewsModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY_NEWS);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSector = (s) => {
    const arr = form.affectedSectors || [];
    set('affectedSectors', arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);
  };

  const handleSave = () => {
    if (!form.title || !form.summary) { alert('Please fill Title and Summary.'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Edit Event' : 'Add Market Event'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" placeholder="RBI raises repo rate by 25bps" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Market Impact</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {IMPACTS.map(imp => (
              <button key={imp} className="btn" style={{ flex: 1, background: form.impact === imp ? IMPACT_BG[imp] : 'var(--bg3)', color: form.impact === imp ? IMPACT_COLORS[imp] : 'var(--text2)', border: `1px solid ${form.impact === imp ? IMPACT_COLORS[imp] : 'var(--border)'}` }} onClick={() => set('impact', imp)}>{imp}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Summary *</label>
          <textarea className="form-textarea" placeholder="What happened? What was the market reaction? Why does it matter?" value={form.summary} onChange={e => set('summary', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Affected Sectors</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SECTORS.filter(s => s !== 'All Sectors').map(s => (
              <button key={s} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, background: form.affectedSectors?.includes(s) ? 'rgba(240,180,41,0.1)' : '', borderColor: form.affectedSectors?.includes(s) ? 'var(--accent)' : '', color: form.affectedSectors?.includes(s) ? 'var(--accent)' : '' }} onClick={() => toggleSector(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Impact on Your Trades</label>
          <textarea className="form-textarea" style={{ minHeight: 60 }} placeholder="Which open trades were affected? Did you take action?" value={form.tradeImpact} onChange={e => set('tradeImpact', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Source</label>
          <input className="form-input" placeholder="Economic Times, RBI, NSE, etc." value={form.source} onChange={e => set('source', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Event</button>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ borderLeft: `3px solid ${IMPACT_COLORS[item.impact]}`, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: IMPACT_BG[item.impact], color: IMPACT_COLORS[item.impact], fontFamily: 'var(--font-mono)' }}>{item.impact}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.category}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{item.date}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
          {item.affectedSectors?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              {item.affectedSectors.map(s => (
                <span key={s} style={{ padding: '2px 7px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 10, color: 'var(--text3)' }}>{s}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={e => { e.stopPropagation(); onEdit(item); }}>Edit</button>
          <span style={{ color: 'var(--text3)', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, fontFamily: 'var(--font-body)', marginBottom: 12 }}>{item.summary}</p>
          {item.tradeImpact && (
            <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 7, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Trade Impact</div>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{item.tradeImpact}</p>
            </div>
          )}
          {item.source && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>Source: {item.source}</div>}
        </div>
      )}
    </div>
  );
}

// Upcoming events calendar
const UPCOMING = [
  { date: 'Monthly', event: 'RBI MPC Meeting', category: 'RBI/SEBI', note: '6 times a year — huge impact on banking & rate-sensitive stocks' },
  { date: 'Quarterly', event: 'Quarterly Earnings Season', category: 'Earnings', note: 'Apr, Jul, Oct, Jan — Nifty 50 companies report results' },
  { date: 'Annual', event: 'Union Budget', category: 'Budget', note: 'February 1st — biggest event for Indian markets' },
  { date: 'Monthly', event: 'US Fed Meeting (FOMC)', category: 'Global', note: 'Affects FII flows into India. Rate hikes = FII selling risk' },
  { date: 'Monthly', event: 'India CPI Inflation Data', category: 'Macro', note: 'High inflation → RBI more likely to hike rates' },
  { date: 'Daily', event: 'FII/DII Activity', category: 'FII/DII', note: 'Check NSE website daily under Market → FII/DII Activity' },
];

export default function News() {
  const [news, setNews] = useState(store.getNews());
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('events');

  const refresh = () => setNews(store.getNews());

  const filtered = news.filter(n => filter === 'All' || n.category === filter);

  const handleSave = (form) => {
    if (editing) {
      const updated = news.map(n => n.id === editing.id ? { ...n, ...form } : n);
      store.saveNews(updated);
    } else {
      store.addNews(form);
    }
    refresh();
    setEditing(null);
  };

  const openEdit = (item) => { setEditing(item); setShowModal(true); };
  const openNew = () => { setEditing(null); setShowModal(true); };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>News & Market Events</h2>
            <p>Track macro events, earnings, and their impact on your trades</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Add Event</button>
        </div>
      </div>
      <div className="page-content">
        <div className="pill-nav">
          <button className={tab === 'events' ? 'active' : ''} onClick={() => setTab('events')}>My Events Log</button>
          <button className={tab === 'calendar' ? 'active' : ''} onClick={() => setTab('calendar')}>Events to Watch</button>
        </div>

        {tab === 'calendar' && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: 'rgba(240,180,41,0.04)', borderColor: 'rgba(240,180,41,0.2)' }}>
              <div className="card-title">📅 Key Events Every Indian Trader Must Track</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
                These recurring events move Indian markets significantly. Always check if any of these are scheduled before entering a trade.
              </p>
              {UPCOMING.map((ev, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < UPCOMING.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 1 }}>{ev.date}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.event}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, lineHeight: 1.5 }}>{ev.note}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'events' && (
          <>
            <div className="pill-nav">
              {CATEGORIES.map(c => (
                <button key={c} className={filter === c ? 'active' : ''} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">◐</div>
                <p>No events logged yet. Start tracking market news that affects your trades.</p>
              </div>
            ) : (
              filtered.map(item => <NewsCard key={item.id} item={item} onEdit={openEdit} />)
            )}
          </>
        )}
      </div>

      {showModal && (
        <NewsModal
          item={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
