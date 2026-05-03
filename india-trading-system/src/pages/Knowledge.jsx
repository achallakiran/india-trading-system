import React, { useState, useEffect } from 'react';
import { store } from '../data/store';

const CATEGORIES = ['All', 'Basics', 'Indicators', 'Strategy', 'Risk Management', 'Indian Markets', 'Lessons Learned'];

const CATEGORY_ICONS = {
  'Basics': '◉', 'Indicators': '◎', 'Strategy': '◈',
  'Risk Management': '⬡', 'Indian Markets': '◐', 'Lessons Learned': '★',
};

const EMPTY_ITEM = { category: 'Basics', title: '', content: '', tags: '', tradeLinked: '' };

function KnowledgeModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY_ITEM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title || !form.content) { alert('Please fill Title and Content.'); return; }
    onSave({ ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Edit Concept' : 'Add Knowledge'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" placeholder="What is MACD?" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Content *</label>
          <textarea className="form-textarea" style={{ minHeight: 160 }} placeholder="Explain the concept clearly. What is it? How do you use it? What does it mean for Indian markets?" value={form.content} onChange={e => set('content', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma separated)</label>
          <input className="form-input" placeholder="beginner, technical, indicator" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => set('tags', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Linked Trade ID (optional)</label>
          <input className="form-input" placeholder="Trade ID this was learned from" value={form.tradeLinked || ''} onChange={e => set('tradeLinked', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function KnowledgeCard({ item, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[item.category] || '◉'}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>{item.category}</span>
            {item.tradeLinked && <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>trade-linked</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
          {item.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
              {item.tags.map(tag => (
                <span key={tag} style={{ padding: '2px 7px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={e => { e.stopPropagation(); onEdit(item); }}>Edit</button>
          <span style={{ color: 'var(--text3)', fontSize: 18, lineHeight: 1 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', whiteSpace: 'pre-line', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
          {item.content}
        </div>
      )}
    </div>
  );
}

export default function Knowledge() {
  const [items, setItems] = useState(store.getKnowledge());
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setItems(store.getKnowledge());

  const filtered = items.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q) || item.tags?.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleSave = (form) => {
    if (editing) {
      const updated = items.map(i => i.id === editing.id ? { ...i, ...form } : i);
      store.saveKnowledge(updated);
    } else {
      store.addKnowledge(form);
    }
    refresh();
    setEditing(null);
  };

  const openEdit = (item) => { setEditing(item); setShowModal(true); };
  const openNew = () => { setEditing(null); setShowModal(true); };

  const counts = {};
  CATEGORIES.slice(1).forEach(c => { counts[c] = items.filter(i => i.category === c).length; });

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Knowledge Repository</h2>
            <p>Your evolving guide to Indian markets — grows with every trade</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Add Concept</button>
        </div>
      </div>
      <div className="page-content">

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {Object.entries(counts).slice(0, 4).map(([cat, count]) => (
            <div key={cat} className="stat-tile" style={{ cursor: 'pointer' }} onClick={() => setCategory(cat)}>
              <div className="label">{CATEGORY_ICONS[cat]} {cat}</div>
              <div className="value yellow">{count}</div>
              <div className="sub">concepts</div>
            </div>
          ))}
        </div>

        {/* Filter + search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="pill-nav" style={{ margin: 0 }}>
            {CATEGORIES.map(c => (
              <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>
                {c} {c !== 'All' && counts[c] ? `(${counts[c]})` : ''}
              </button>
            ))}
          </div>
          <input
            className="form-input"
            style={{ width: 220 }}
            placeholder="Search concepts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">◉</div>
            <p>No concepts found. Add your first knowledge entry!</p>
          </div>
        ) : (
          <div>
            {filtered.map(item => (
              <KnowledgeCard key={item.id} item={item} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <KnowledgeModal
          item={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
