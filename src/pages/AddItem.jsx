import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pantryService } from '../pantryService';

const UNITS = ['pz', 'g', 'kg', 'ml', 'L', 'conf', 'busta'];

function toDateInput(isoOrDate) {
  if (!isoOrDate) return '';
  return isoOrDate.split('T')[0];
}

export default function AddItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [openedAt, setOpenedAt] = useState('');
  const [openedExpiryDays, setOpenedExpiryDays] = useState('');
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenAt, setFrozenAt] = useState('');
  const [frozenExpiryDays, setFrozenExpiryDays] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([pantryService.getCategories(), pantryService.getLocations()])
      .then(([cats, locs]) => { setCategories(cats); setLocations(locs); });
    if (isEdit) {
      pantryService.getItem(id).then(item => {
        setName(item.name || '');
        setBrand(item.brand || '');
        setCategoryId(item.category_id || '');
        setLocationId(item.storage_location_id || '');
        setQuantity(item.quantity?.toString() || '1');
        setUnit(item.unit || '');
        setExpiryDate(toDateInput(item.expiry_date));
        setIsOpened(item.is_opened || false);
        setOpenedAt(toDateInput(item.opened_at));
        setOpenedExpiryDays(item.opened_expiry_days?.toString() || '');
        setIsFrozen(item.is_frozen || false);
        setFrozenAt(toDateInput(item.frozen_at));
        setFrozenExpiryDays(item.frozen_expiry_days?.toString() || '');
        setNotes(item.notes || '');
      });
    }
  }, [id]);

  const handleLocationChange = (loc) => {
    setLocationId(loc.id);
    if (loc.type === 'freezer') {
      setIsFrozen(true);
      if (!frozenAt) setFrozenAt(today);
    }
  };

  const handleFrozenToggle = (val) => {
    setIsFrozen(val);
    if (val && !frozenAt) setFrozenAt(today);
  };

  const handleOpenedToggle = (val) => {
    setIsOpened(val);
    if (val && !openedAt) setOpenedAt(today);
  };

  const calcExpiryDate = (fromDate, days) => {
    if (!fromDate || !days) return null;
    return new Date(new Date(fromDate).getTime() + parseInt(days) * 86400000).toLocaleDateString('it-IT');
  };

  const handleSave = async () => {
    if (!name.trim()) return setError('Il nome è obbligatorio');
    setLoading(true); setError('');
    try {
      const data = {
        name: name.trim(),
        brand: brand.trim() || null,
        category_id: categoryId || null,
        storage_location_id: locationId || null,
        quantity: parseFloat(quantity) || 1,
        unit: unit || null,
        expiry_date: expiryDate || null,
        is_opened: isOpened,
        opened_at: isOpened && openedAt ? new Date(openedAt).toISOString() : null,
        opened_expiry_days: openedExpiryDays ? parseInt(openedExpiryDays) : null,
        is_frozen: isFrozen,
        frozen_at: isFrozen && frozenAt ? new Date(frozenAt).toISOString() : null,
        frozen_expiry_days: frozenExpiryDays ? parseInt(frozenExpiryDays) : null,
        notes: notes.trim() || null,
      };
      if (isEdit) await pantryService.updateItem(id, data);
      else await pantryService.createItem(data);
      navigate('/pantry');
    } catch (e) { setError(e.response?.data?.error || 'Impossibile salvare'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>{isEdit ? 'Modifica' : 'Aggiungi'}</span>
      </div>

      <div style={{ padding: '16px' }}>
        <div className="input-group">
          <label className="input-label">Nome *</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="es: Latte intero" />
        </div>

        <div className="input-group">
          <label className="input-label">Brand</label>
          <input className="input" value={brand} onChange={e => setBrand(e.target.value)} placeholder="es: Granarolo" />
        </div>

        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>Categoria</label>
        <div className="chips-scroll" style={{ marginBottom: 16 }}>
          {categories.map(c => (
            <button key={c.id} className={`chip ${categoryId == c.id ? 'active' : ''}`} onClick={() => setCategoryId(c.id)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        <label className="input-label" style={{ display: 'block', marginBottom: 8 }}>Posizione</label>
        <div className="chips-scroll" style={{ marginBottom: 16 }}>
          {locations.map(l => (
            <button key={l.id} className={`chip ${locationId == l.id ? 'active' : ''}`} onClick={() => handleLocationChange(l)}>
              {l.type === 'freezer' ? '❄️ ' : ''}{l.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Quantità</label>
            <input className="input" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Unità</label>
            <input className="input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="pz, g, ml..." />
          </div>
        </div>
        <div className="chips-scroll" style={{ marginBottom: 16 }}>
          {UNITS.map(u => <button key={u} className={`chip ${unit === u ? 'active' : ''}`} onClick={() => setUnit(u)}>{u}</button>)}
        </div>

        <div className="input-group">
          <label className="input-label">Data scadenza originale</label>
          <input className="input" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} style={{ colorScheme: 'dark' }} />
        </div>

        {/* APERTO */}
        <div className="switch-row">
          <div className="switch-info">
            <div className="switch-label">📂 Prodotto aperto</div>
            <div className="switch-sub">Traccia scadenza ridotta dopo apertura</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isOpened} onChange={e => handleOpenedToggle(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
        {isOpened && (
          <>
            <div className="input-group">
              <label className="input-label">Data apertura</label>
              <input className="input" type="date" value={openedAt} onChange={e => setOpenedAt(e.target.value)} style={{ colorScheme: 'dark' }} max={today} />
            </div>
            <div className="input-group">
              <label className="input-label">Consumare entro (giorni dall'apertura)</label>
              <input className="input" type="number" value={openedExpiryDays} onChange={e => setOpenedExpiryDays(e.target.value)} placeholder="es: 3" />
            </div>
            {calcExpiryDate(openedAt, openedExpiryDays) && (
              <p style={{ fontSize: 13, color: 'var(--orange)', marginBottom: 16, marginTop: -8 }}>
                ⚠️ Scadenza dopo apertura: {calcExpiryDate(openedAt, openedExpiryDays)}
              </p>
            )}
          </>
        )}

        {/* CONGELATO */}
        <div className="switch-row">
          <div className="switch-info">
            <div className="switch-label">❄️ Prodotto congelato</div>
            <div className="switch-sub">La scadenza si basa sulla data di congelamento</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isFrozen} onChange={e => handleFrozenToggle(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
        {isFrozen && (
          <>
            <div className="input-group">
              <label className="input-label">Data congelamento</label>
              <input className="input" type="date" value={frozenAt} onChange={e => setFrozenAt(e.target.value)} style={{ colorScheme: 'dark' }} max={today} />
            </div>
            <div className="input-group">
              <label className="input-label">Giorni massimi in freezer</label>
              <input className="input" type="number" value={frozenExpiryDays} onChange={e => setFrozenExpiryDays(e.target.value)} placeholder="es: 90" />
            </div>
            {calcExpiryDate(frozenAt, frozenExpiryDays) && (
              <p style={{ fontSize: 13, color: '#5BC4E8', marginBottom: 16, marginTop: -8 }}>
                ❄️ Scadenza in freezer: {calcExpiryDate(frozenAt, frozenExpiryDays)}
              </p>
            )}
          </>
        )}

        <div className="input-group">
          <label className="input-label">Note</label>
          <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note libere..." />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Salvataggio...' : isEdit ? 'Salva modifiche' : 'Aggiungi alla dispensa'}
        </button>
      </div>
    </div>
  );
}
