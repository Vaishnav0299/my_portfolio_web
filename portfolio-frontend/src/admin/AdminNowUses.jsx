import React, { useState, useEffect } from 'react';
import { Compass, Laptop, Plus, Trash2, Check, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';

export function AdminNowUses() {
  const [activeTab, setActiveTab] = useState('now'); // 'now' | 'uses'
  const [nowItems, setNowItems] = useState([]);
  const [usesCategories, setUsesCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Form states for new Now item
  const [newNow, setNewNow] = useState({ text: '', tag: 'shipping' });

  // Form states for new Uses category
  const [newCatName, setNewCatName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [nowRes, usesRes] = await Promise.all([
        api.getNow(),
        api.getUses(),
      ]);
      const cleanNow = (nowRes.data || []).map(({ emoji, ...rest }) => rest);
      setNowItems(cleanNow);
      setUsesCategories(usesRes.data || []);
    } catch {
      setError('Failed to load Now & Uses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Now handlers ──
  const handleAddNow = async (e) => {
    e.preventDefault();
    if (!newNow.text.trim()) return;
    setSaving(true);
    try {
      const res = await api.addNowItem(newNow);
      setNowItems((res.data || []).map(({ emoji, ...rest }) => rest));
      setNewNow({ text: '', tag: 'shipping' });
      showToast('Added Now item');
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNow = async (idx) => {
    setSaving(true);
    try {
      const res = await api.deleteNowItem(idx);
      setNowItems((res.data || []).map(({ emoji, ...rest }) => rest));
      showToast('Deleted item');
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllNow = async () => {
    setSaving(true);
    try {
      const sanitized = nowItems.map(({ emoji, ...rest }) => rest);
      const res = await api.updateNow(sanitized);
      setNowItems((res.data || []).map(({ emoji, ...rest }) => rest));
      showToast('Saved all Now items');
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Uses handlers ──
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    setUsesCategories([...usesCategories, { category: newCatName.trim(), items: [] }]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catIdx) => {
    const next = usesCategories.filter((_, i) => i !== catIdx);
    setUsesCategories(next);
  };

  const handleAddItemToCategory = (catIdx) => {
    const next = [...usesCategories];
    next[catIdx].items.push({ name: 'Tool Name', note: 'Brief note or purpose' });
    setUsesCategories(next);
  };

  const handleDeleteItem = (catIdx, itemIdx) => {
    const next = [...usesCategories];
    next[catIdx].items = next[catIdx].items.filter((_, i) => i !== itemIdx);
    setUsesCategories(next);
  };

  const handleItemChange = (catIdx, itemIdx, field, val) => {
    const next = [...usesCategories];
    next[catIdx].items[itemIdx][field] = val;
    setUsesCategories(next);
  };

  const handleSaveUses = async () => {
    setSaving(true);
    try {
      const res = await api.updateUses(usesCategories);
      setUsesCategories(res.data);
      showToast('Saved Uses setup');
    } catch (err) {
      setError(err.message || 'Failed to save Uses');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    padding: '0.65rem 0.85rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass style={{ color: 'var(--accent-primary)', width: 28, height: 28 }} />
            Now & Uses Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage your personal live pulse (/now) and developer equipment & tools (/uses).
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 4 }}>
          <button
            onClick={() => setActiveTab('now')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
              background: activeTab === 'now' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'now' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            <Compass style={{ width: 16, height: 16 }} /> What I'm Doing Now
          </button>
          <button
            onClick={() => setActiveTab('uses')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
              background: activeTab === 'uses' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'uses' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            <Laptop style={{ width: 16, height: 16 }} /> Developer Uses
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw style={{ width: 24, height: 24, animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
          Loading...
        </div>
      ) : activeTab === 'now' ? (
        // ── NOW TAB ──
        <div>
          {/* Add form */}
          <form onSubmit={handleAddNow} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={newNow.text}
              onChange={(e) => setNewNow({ ...newNow, text: e.target.value })}
              placeholder="What are you working on or exploring right now?"
              required
            />
            <select
              style={{ ...inputStyle, width: 130 }}
              value={newNow.tag}
              onChange={(e) => setNewNow({ ...newNow, tag: e.target.value })}
            >
              <option value="shipping">shipping</option>
              <option value="learning">learning</option>
              <option value="reading">reading</option>
              <option value="available">available</option>
              <option value="writing">writing</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.25rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <Plus style={{ width: 16, height: 16 }} /> Add
            </button>
          </form>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {nowItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={item.text}
                    onChange={(e) => {
                      const next = [...nowItems];
                      next[idx].text = e.target.value;
                      setNowItems(next);
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                    {item.tag}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteNow(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}
                  title="Delete"
                >
                  <Trash2 style={{ width: 17, height: 17 }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              onClick={handleSaveAllNow}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Save style={{ width: 16, height: 16 }} /> Save All Now Items
            </button>
          </div>
        </div>
      ) : (
        // ── USES TAB ──
        <div>
          {/* Add Category Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New Category Name (e.g. Cloud & DevOps, Hardware, Desk Setup)..."
            />
            <button
              onClick={handleAddCategory}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.25rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus style={{ width: 16, height: 16 }} /> Add Category
            </button>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {usesCategories.map((cat, catIdx) => (
              <div key={catIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAddItemToCategory(catIdx)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', background: 'rgba(139,92,246,0.1)', color: 'var(--accent-primary)', border: 'none', borderRadius: 6, padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <Plus style={{ width: 14, height: 14 }} /> Add Tool
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(catIdx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      title="Delete Category"
                    >
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {cat.items.map((item, itemIdx) => (
                    <div key={itemIdx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 36px', gap: '0.6rem', alignItems: 'center' }}>
                      <input
                        style={inputStyle}
                        value={item.name}
                        onChange={(e) => handleItemChange(catIdx, itemIdx, 'name', e.target.value)}
                        placeholder="Tool Name"
                      />
                      <input
                        style={inputStyle}
                        value={item.note}
                        onChange={(e) => handleItemChange(catIdx, itemIdx, 'note', e.target.value)}
                        placeholder="Description / Role / Note"
                      />
                      <button
                        onClick={() => handleDeleteItem(catIdx, itemIdx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                        title="Remove Tool"
                      >
                        <Trash2 style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              onClick={handleSaveUses}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Save style={{ width: 16, height: 16 }} /> Save All Uses Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNowUses;
