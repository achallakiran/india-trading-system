import React, { useState, useEffect } from 'react';
import { store } from '../data/store';

const EMPTY_TRADE = {
  symbol: '', style: 'intraday', direction: 'buy',
  entryPrice: '', qty: '', entryDate: new Date().toISOString().split('T')[0],
  stopLoss: '', target: '', exitPrice: '', exitDate: '',
  status: 'open', reason: '', marketContext: '', pnl: null,
  sector: '', strategy: '',
};

const SECTORS = ['Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 'Energy', 'Infra', 'Metal', 'Real Estate', 'Telecom', 'Other'];
const STRATEGIES = ['ORB (Opening Range Breakout)', 'EMA Crossover', 'RSI Oversold/Overbought', 'Support/Resistance', 'Breakout', 'News-based', 'Fundamental', 'Other'];

function calcPnl(trade) {
  const entry = parseFloat(trade.entryPrice);
  const exit = parseFloat(trade.exitPrice);
  const qty = parseFloat(trade.qty);
  if (!entry || !exit || !qty) return null;
  return trade.direction === 'buy' ? (exit - entry) * qty : (entry - exit) * qty;
}

function TradeModal({ trade, onClose, onSave }) {
  const [form, setForm] = useState(trade || EMPTY_TRADE);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.symbol || !form.entryPrice || !form.qty) {
      alert('Please fill Symbol, Entry Price, and Quantity at minimum.');
      return;
    }
    const pnl = form.status === 'closed' ? calcPnl(form) : null;
    onSave({ ...form, pnl, entryPrice: +form.entryPrice, exitPrice: form.exitPrice ? +form.exitPrice : null, qty: +form.qty, stopLoss: form.stopLoss ? +form.stopLoss : null, target: form.target ? +form.target : null });
    onClose();
  };

  const rr = () => {
    const e = +form.entryPrice, sl = +form.stopLoss, t = +form.target;
    if (!e || !sl || !t) return null;
    const risk = Math.abs(e - sl), reward = Math.abs(t - e);
    return reward / risk;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{trade ? 'Edit Trade' : 'Log New Trade'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Symbol *</label>
            <input className="form-input" placeholder="e.g. RELIANCE, NIFTY50" value={form.symbol} onChange={e => set('symbol', e.target.value.toUpperCase())} />
          </div>
          <div className="form-group">
            <label className="form-label">Sector</label>
            <select className="form-select" value={form.sector} onChange={e => set('sector', e.target.value)}>
              <option value="">Select sector</option>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Style *</label>
            <select className="form-select" value={form.style} onChange={e => set('style', e.target.value)}>
              <option value="intraday">Intraday</option>
              <option value="swing">Swing</option>
              <option value="longterm">Long Term</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Direction *</label>
            <select className="form-select" value={form.direction} onChange={e => set('direction', e.target.value)}>
              <option value="buy">Buy (Long)</option>
              <option value="sell">Sell (Short)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Entry Price ₹ *</label>
            <input className="form-input" type="number" placeholder="500.00" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Qty / Lots *</label>
            <input className="form-input" type="number" placeholder="100" value={form.qty} onChange={e => set('qty', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Entry Date</label>
            <input className="form-input" type="date" value={form.entryDate} onChange={e => set('entryDate', e.target.value)} />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Stop Loss ₹</label>
            <input className="form-input" type="number" placeholder="490.00" value={form.stopLoss} onChange={e => set('stopLoss', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target ₹</label>
            <input className="form-input" type="number" placeholder="520.00" value={form.target} onChange={e => set('target', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Risk:Reward</label>
            <div className="form-input" style={{ color: rr() ? (rr() >= 1.5 ? 'var(--green)' : 'var(--red)') : 'var(--text3)' }}>
              {rr() ? `1 : ${rr().toFixed(2)}` : '—'}
            </div>
          </div>
        </div>

        {form.status === 'closed' && (
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Exit Price ₹</label>
              <input className="form-input" type="number" placeholder="515.00" value={form.exitPrice} onChange={e => set('exitPrice', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Exit Date</label>
              <input className="form-input" type="date" value={form.exitDate} onChange={e => set('exitDate', e.target.value)} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Strategy Used</label>
          <select className="form-select" value={form.strategy} onChange={e => set('strategy', e.target.value)}>
            <option value="">Select strategy</option>
            {STRATEGIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Why this trade? (Reason / Setup)</label>
          <textarea className="form-textarea" placeholder="e.g. RSI was below 30, stock near strong support, volume increasing..." value={form.reason} onChange={e => set('reason', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Market Context (News / Events affecting this)</label>
          <textarea className="form-textarea" placeholder="e.g. RBI policy next week, quarterly results due, FII buying in sector..." value={form.marketContext} onChange={e => set('marketContext', e.target.value)} style={{ minHeight: 60 }} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Trade</button>
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const [trades, setTrades] = useState(store.getTrades());
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setTrades(store.getTrades());

  const filtered = filter === 'all' ? trades : trades.filter(t => t.style === filter || t.status === filter);

  const handleSave = (form) => {
    if (editing) {
      store.updateTrade(editing.id, form);
    } else {
      store.addTrade(form);
    }
    refresh();
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this trade?')) { store.deleteTrade(id); refresh(); }
  };

  const openEdit = (trade) => { setEditing(trade); setShowModal(true); };
  const openNew = () => { setEditing(null); setShowModal(true); };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Trade Journal</h2>
            <p>Log every paper trade — intraday, swing, and long-term</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Log Trade</button>
        </div>
      </div>
      <div className="page-content">
        <div className="pill-nav">
          {['all','intraday','swing','longterm','open','closed'].map(f => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'longterm' ? 'Long Term' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">◈</div>
            <p>No trades here yet. Hit "+ Log Trade" to begin your paper trading journey.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Style</th>
                    <th>Dir</th>
                    <th>Entry ₹</th>
                    <th>SL ₹</th>
                    <th>Target ₹</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Strategy</th>
                    <th>P&L ₹</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{t.symbol}</td>
                      <td><span className={`tag ${t.style}`}>{t.style === 'longterm' ? 'LT' : t.style}</span></td>
                      <td><span className={`tag ${t.direction}`}>{t.direction.toUpperCase()}</span></td>
                      <td className="mono">₹{Number(t.entryPrice).toLocaleString('en-IN')}</td>
                      <td className="mono" style={{ color: 'var(--red)' }}>{t.stopLoss ? `₹${Number(t.stopLoss).toLocaleString('en-IN')}` : '—'}</td>
                      <td className="mono" style={{ color: 'var(--green)' }}>{t.target ? `₹${Number(t.target).toLocaleString('en-IN')}` : '—'}</td>
                      <td className="mono">{t.qty}</td>
                      <td className="muted" style={{ fontSize: 11 }}>{t.entryDate}</td>
                      <td style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.strategy || '—'}</td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: t.pnl == null ? 'var(--text3)' : t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {t.pnl == null ? '—' : `${t.pnl >= 0 ? '+' : ''}₹${Math.abs(t.pnl).toLocaleString('en-IN')}`}
                      </td>
                      <td><span className={`tag ${t.status}`}>{t.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(t)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => handleDelete(t.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TradeModal
          trade={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
