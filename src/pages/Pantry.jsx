import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pantryService, getExpiryColor, getExpiryLabel } from '../pantryService';

const FILTERS = [
  { key: 'all', label: 'Tutti' },
  { key: 'expiring', label: '⚠️ Scadenza' },
  { key: 'opened', label: '📂 Aperti' },
  { key: 'frozen', label: '🧊 Freezer' },
];

export default function Pantry() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async (f = filter, q = search) => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      if (q) params.search = q;
      if (f === 'expiring') params.expiring_in_days = 7;
      if (f === 'opened') params.is_opened = true;
      if (f === 'frozen') params.is_frozen = true;
      const data = await pantryService.getItems(params);
      setItems(data.items);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onFilter = (f) => { setFilter(f); setSearch(''); load(f, ''); };
  const onSearch = (q) => { setSearch(q); load(filter, q); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dispensa</h1>
        <button className="btn-icon" onClick={() => navigate('/add-item')}>+</button>
      </div>

      <div className="search-row">
        <div className="search-box">
          <span>🔍</span>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Cerca alimento..." />
          {search && <button onClick={() => onSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>}
        </div>
      </div>

      <div className="chips-scroll" style={{ padding: '0 16px' }}>
        {FILTERS.map(f => (
          <button key={f.key} className={`chip ${filter === f.key ? 'active' : ''}`} onClick={() => onFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🥬</div>
          <div className="empty-text">Nessun alimento trovato</div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px', marginTop: 8 }} onClick={() => navigate('/add-item')}>Aggiungi il primo</button>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {items.map(item => {
            const days = item.days_until_expiry;
            const colorClass = getExpiryColor(days);
            const label = getExpiryLabel(days, item.effective_expiry_date);
            return (
              <div key={item.id} className="item-card" onClick={() => navigate(`/item/${item.id}`)}>
                <div className="item-card-top">
                  <span className="item-icon">{item.category_icon || '📦'}</span>
                  <div className="item-title">
                    <div className="item-name">{item.name}</div>
                    {item.brand && <div className="item-brand">{item.brand}</div>}
                  </div>
                  <div className="item-badges">
                    {item.is_opened && <span className="badge">Aperto</span>}
                    {item.is_frozen && <span className="badge badge-blue">❄️</span>}
                  </div>
                </div>
                <div className="item-card-bottom">
                  <span className="item-qty">{item.quantity} {item.unit || 'pz'}</span>
                  <span className="item-location">{item.location_name || '—'}</span>
                  <span className={`item-expiry ${colorClass}`}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
