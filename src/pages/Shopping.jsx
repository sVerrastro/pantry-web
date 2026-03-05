import { useState, useEffect } from 'react';
import { pantryService } from '../pantryService';

export default function Shopping() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');

  useEffect(() => { pantryService.getShoppingList().then(setItems).finally(() => setLoading(false)); }, []);

  const toggle = async (item) => {
    try {
      await pantryService.updateShoppingItem(item.id, { is_purchased: !item.is_purchased });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: !i.is_purchased } : i));
    } catch { alert('Errore'); }
  };

  const remove = async (id) => {
    try { await pantryService.deleteShoppingItem(id); setItems(prev => prev.filter(i => i.id !== id)); }
    catch { alert('Errore'); }
  };

  const clearPurchased = async () => {
    if (!confirm('Rimuovere tutti gli elementi spuntati?')) return;
    try { await pantryService.clearPurchased(); setItems(prev => prev.filter(i => !i.is_purchased)); }
    catch { alert('Errore'); }
  };

  const addItem = async () => {
    if (!newName.trim()) return;
    try {
      const item = await pantryService.addToShoppingList({ name: newName.trim(), quantity: newQty ? parseFloat(newQty) : null, unit: newUnit || null });
      setItems(prev => [item, ...prev]);
      setNewName(''); setNewQty(''); setNewUnit(''); setModal(false);
    } catch { alert('Errore'); }
  };

  const pending = items.filter(i => !i.is_purchased);
  const purchased = items.filter(i => i.is_purchased);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lista spesa</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {purchased.length > 0 && (
            <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: 13 }} onClick={clearPurchased}>Pulisci ✓</button>
          )}
          <button className="btn-icon" onClick={() => setModal(true)}>+</button>
        </div>
      </div>

      <p style={{ padding: '0 16px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>{pending.length} da comprare</p>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🛒</div>
          <div className="empty-text">Lista vuota</div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px', marginTop: 8 }} onClick={() => setModal(true)}>Aggiungi elemento</button>
        </div>
      ) : (
        <div className="card" style={{ margin: '0 16px' }}>
          {[...pending, ...purchased].map(item => (
            <div key={item.id} className="shopping-item">
              <div className={`checkbox ${item.is_purchased ? 'checked' : ''}`} onClick={() => toggle(item)}>
                {item.is_purchased && <span className="checkmark">✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div className={`shopping-name ${item.is_purchased ? 'done' : ''}`}>{item.name}</div>
                {(item.quantity || item.unit) && <div className="shopping-qty">{item.quantity || ''} {item.unit || ''}</div>}
              </div>
              <button className="delete-btn" onClick={() => remove(item.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Aggiungi alla lista</h2>
            <input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Cosa devi comprare?" autoFocus onKeyDown={e => e.key === 'Enter' && addItem()} />
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" style={{ flex: 1 }} value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Quantità" type="number" />
              <input className="input" style={{ flex: 1 }} value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Unità" />
            </div>
            <div className="modal-btns">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(false)}>Annulla</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={addItem}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
