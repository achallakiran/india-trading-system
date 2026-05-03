import React, { useState, useEffect } from 'react';
import { store } from '../data/store';

const CAPITAL = 100000; // paper trading capital ₹1L

export default function Dashboard() {
  const [stats, setStats] = useState(store.getStats());
  const [trades, setTrades] = useState(store.getTrades());
  const [news, setNews] = useState(store.getNews());
  const [knowledge, setKnowledge] = useState(store.getKnowledge());

  useEffect(() => {
    setStats(store.getStats());
    setTrades(store.getTrades());
    setNews(store.getNews());
    setKnowledge(store.getKnowledge());
  }, []);

  const pnlColor = stats.totalPnl >= 0 ? 'green' : 'red';
  const pnlSign = stats.totalPnl >= 0 ? '+' : '';
  const recentTrades = trades.slice(0, 5);
  const recentNews = news.slice(0, 3);

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Your paper trading command centre — Indian equity markets</p>
      </div>
      <div className="page-content">

        {/* Capital banner */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #18181f 0%, #1e1e2a 100%)', borderColor: 'rgba(240,180,41,0.2)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Paper Capital</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                ₹{(CAPITAL + stats.totalPnl).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: stats.totalPnl >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {pnlSign}₹{Math.abs(stats.totalPnl).toLocaleString('en-IN')} ({pnlSign}{((stats.totalPnl / CAPITAL) * 100).toFixed(2)}%) total P&L
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{stats.winRate}%</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Win Rate</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{stats.openTrades}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Open</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.closedTrades}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Closed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-tile">
            <div className="label">Total Trades</div>
            <div className="value">{stats.totalTrades}</div>
            <div className="sub">paper trades logged</div>
          </div>
          <div className="stat-tile">
            <div className="label">Best Trade</div>
            <div className={`value ${stats.bestTrade >= 0 ? 'green' : 'red'}`}>
              {stats.bestTrade >= 0 ? '+' : ''}₹{stats.bestTrade.toLocaleString('en-IN')}
            </div>
            <div className="sub">single trade</div>
          </div>
          <div className="stat-tile">
            <div className="label">Worst Trade</div>
            <div className={`value ${stats.worstTrade >= 0 ? 'green' : 'red'}`}>
              {stats.worstTrade >= 0 ? '+' : ''}₹{stats.worstTrade.toLocaleString('en-IN')}
            </div>
            <div className="sub">single trade</div>
          </div>
          <div className="stat-tile">
            <div className="label">Knowledge</div>
            <div className="value yellow">{knowledge.length}</div>
            <div className="sub">concepts learned</div>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Recent Trades */}
          <div className="card">
            <div className="card-title">Recent Trades</div>
            {recentTrades.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div className="icon">◈</div>
                <p>No trades yet. Start in the Journal →</p>
              </div>
            ) : (
              <div>
                {recentTrades.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{t.style} · {t.entryDate}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`tag ${t.status}`}>{t.status}</span>
                      {t.pnl !== undefined && t.pnl !== null && (
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                          {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent News */}
          <div>
            <div className="card">
              <div className="card-title">Latest Market Events</div>
              {recentNews.map(n => (
                <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span className={`tag ${n.impact === 'Bullish' ? 'buy' : n.impact === 'Bearish' ? 'sell' : 'open'}`}>{n.impact}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{n.date} · {n.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phase guide */}
            <div className="card" style={{ borderColor: 'rgba(240,180,41,0.2)' }}>
              <div className="card-title">Your Journey — Phase 1</div>
              {[
                { done: true, label: 'System set up & deployed' },
                { done: stats.totalTrades >= 1, label: 'Log first paper trade' },
                { done: stats.totalTrades >= 5, label: 'Complete 5 paper trades' },
                { done: stats.totalTrades >= 20, label: 'Complete 20 paper trades' },
                { done: false, label: 'Connect Groww API (₹499/mo)' },
                { done: false, label: 'Graduate to real money' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <span style={{ fontSize: 14, color: step.done ? 'var(--green)' : 'var(--border2)' }}>
                    {step.done ? '✓' : '○'}
                  </span>
                  <span style={{ fontSize: 13, color: step.done ? 'var(--text)' : 'var(--text3)', textDecoration: step.done ? 'none' : 'none' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
