import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pantryService, getExpiryColor, getExpiryLabel } from '../pantryService';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consumeModal, setConsumeModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [consumeQty, setConsumeQty] = useState('');
  const [openDays, setOpenDays] = useState('');

  const load = async () => {
    try { setItem(await pantryService.getItem(id)); }
    catch { navigate('/pantry'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleConsume = async () => {
    try {
      await pantryService.consumeItem(id, parseFloat(consumeQty) || item.quantity);
      setConsumeModal(false);
      navigate('/pantry');
    } catch { alert('Errore'); }
  };

  const handleOpen = async () => {
    try {
      await pantryService.openItem(id, openDays ? parseInt(openDays) : null);
      setOpenModal(false);
      load();
    } catch { alert('Errore'); }
  };

  const handleDelete = async (action) => {
    if (!confirm(action === 'consumed' ? 'Segna come consumato?' : 'Buttare via?')) return;
    try { await pantryService.deleteItem(id, action); navigate('/pantry'); }
    catch { alert('Errore'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!item) return null;

  const days = item.days_until_expiry;
  const colorClass = getExpiryColor(days);
  const label = getExpiryLabel(days, item.effective_expiry_date);

  return (
    <div>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>Dettaglio</span>
      </div>

      <div className="detail-header">
        <div className="detail-icon">{item.category_icon || '📦'}</div>
        <h1 className="detail-name">{item.name}</h1>
        {item.brand && <p className="detail-brand">{item.brand}</p>}
        <div className={`expiry-badge ${colorClass}`}>{label}</div>
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        <div className="card" style={{ marginBottom: 20 }}>
          {[
            { label: 'Quantità', value: `${item.quantity} ${item.unit || 'pz'}`, color: 'var(--cream)' },
            { label: 'Categoria', value: item.category_name },
            { label: 'Posizione', value: item.location_name },
            { label: 'Scadenza', value: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('it-IT') : null },
            item.is_opened ? { label: 'Aperto il', value: item.opened_at ? new Date(item.opened_at).toLocaleDateString('it-IT') : null, color: 'var(--yellow)' } : null,
            item.is_frozen ? { label: 'Congelato', value: '✅', color: '#5BC4E8' } : null,
            item.notes ? { label: 'Note', value: item.notes } : null,
          ].filter(Boolean).map(row => (
            <div key={row.label} className="info-row">
              <span className="info-label">{row.label}</span>
              <span className="info-value" style={row.color ? { color: row.color } : {}}>{row.value || '—'}</span>
            </div>
          ))}
        </div>

        <div className="detail-actions">
          <button className="detail-action" onClick={() => setConsumeModal(true)}>
            <span className="detail-action-emoji">✅</span>
            <span className="detail-action-label" style={{ color: 'var(--green)' }}>Consumato</span>
          </button>
          {!item.is_opened && (
            <button className="detail-action" onClick={() => setOpenModal(true)}>
              <span className="detail-action-emoji">📂</span>
              <span className="detail-action-label" style={{ color: 'var(--yellow)' }}>Apri</span>
            </button>
          )}
          <button className="detail-action" onClick={() => navigate(`/add-item/${id}`)}>
            <span className="detail-action-emoji">✏️</span>
            <span className="detail-action-label">Modifica</span>
          </button>
          <button className="detail-action" onClick={() => handleDelete('discarded')}>
            <span className="detail-action-emoji">🗑️</span>
            <span className="detail-action-label" style={{ color: 'var(--red)' }}>Rimuovi</span>
          </button>
        </div>
      </div>

      {consumeModal && (
        <div className="modal-overlay" onClick={() => setConsumeModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Quanto hai consumato?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Disponibile: {item.quantity} {item.unit || 'pz'}</p>
            <input className="input" value={consumeQty} onChange={e => setConsumeQty(e.target.value)} placeholder={`${item.quantity} (tutto)`} type="number" autoFocus />
            <div className="modal-btns">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConsumeModal(false)}>Annulla</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConsume}>Conferma</button>
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">📂 Segna come aperto</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Entro quanti giorni va consumato?</p>
            <input className="input" value={openDays} onChange={e => setOpenDays(e.target.value)} placeholder="es: 3 (lascia vuoto se non sai)" type="number" autoFocus />
            <div className="modal-btns">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOpenModal(false)}>Annulla</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleOpen}>Apri</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
