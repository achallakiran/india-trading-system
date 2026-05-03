import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Screener from './pages/Screener';
import Knowledge from './pages/Knowledge';
import News from './pages/News';
import Backtester from './pages/Backtester';
import Settings from './pages/Settings';

const NAV = [
  { label: 'Dashboard', icon: '⬡', path: '/' },
  { section: 'TRADE' },
  { label: 'Journal', icon: '◈', path: '/journal' },
  { label: 'Backtester', icon: '↺', path: '/backtester' },
  { label: 'Screener', icon: '◎', path: '/screener' },
  { section: 'LEARN' },
  { label: 'Knowledge', icon: '◉', path: '/knowledge' },
  { label: 'News & Events', icon: '◐', path: '/news' },
  { section: 'SYSTEM' },
  { label: 'Settings', icon: '⚙', path: '/settings' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>India Trading<br />System</h1>
        <p>paper mode · v1.0</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map((item, i) =>
          item.section
            ? <div key={i} className="nav-section">{item.section}</div>
            : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="phase-badge">⬡ Phase 1</div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/backtester" element={<Backtester />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/news" element={<News />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
