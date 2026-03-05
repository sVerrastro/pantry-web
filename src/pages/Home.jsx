import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { pantryService, getExpiryColor, getExpiryLabel } from '../pantryService';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState({ expired: [], expiring_soon: [], low_stock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([pantryService.getSummary(), pantryService.getAlerts()])
      .then(([s, a]) => { setSummary(s); setAlerts(a); })
      .finally(() => setLoading(false));
  }, []);

  const allAlerts = [...(alerts.expired || []), ...(alerts.expiring_soon || []), ...(alerts.low_stock || [])]
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div style={{ paddingBottom: 20 }}>
      <div className="page-header">
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{greeting},</p>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--cream)' }}>
            {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
      </div>

      {summary && (
        <div className="summary-grid">
          {[
            { label: 'In dispensa', value: summary.total_items, color: 'var(--green)' },
            { label: 'Aperti', value: summary.opened_items, color: 'var(--yellow)' },
            { label: 'Congelati', value: summary.frozen_items, color: '#5BC4E8' },
            { label: 'In scadenza', value: parseInt(summary.expiring_week || 0) + parseInt(summary.expired_items || 0), color: 'var(--red)' },
          ].map(c => (
            <div key={c.label} className="summary-card" style={{ borderColor: c.color + '40' }}>
              <div className="summary-value" style={{ color: c.color }}>{c.value}</div>
              <div className="summary-label">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {allAlerts.length > 0 && (
        <div className="section">
          <div className="section-title">⚠️ Da controllare</div>
          <div className="alert-list">
            {allAlerts.map(item => {
              const days = item.days_until_expiry;
              const colorClass = getExpiryColor(days);
              const label = getExpiryLabel(days, item.effective_expiry_date);
              const dotColors = { 'expiry-red': 'var(--red)', 'expiry-orange': 'var(--orange)', 'expiry-yellow': 'var(--yellow)', 'expiry-green': 'var(--green)', 'expiry-muted': 'var(--text-muted)' };
              return (
                <div key={item.id} className="alert-item" onClick={() => navigate(`/item/${item.id}`)}>
                  <div className="alert-dot" style={{ background: dotColors[colorClass] }} />
                  <div className="alert-info">
                    <div className="alert-name">{item.name}</div>
                    <div className="alert-brand">{item.brand || item.category_name || '—'}</div>
                  </div>
                  <div className={`alert-expiry ${colorClass}`}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-title">Azioni rapide</div>
        <div className="actions-grid">
          {[
            { emoji: '➕', label: 'Aggiungi', action: () => navigate('/add-item') },
            { emoji: '📦', label: 'Inventario', action: () => navigate('/pantry') },
            { emoji: '🛒', label: 'Spesa', action: () => navigate('/shopping') },
            { emoji: '👤', label: 'Profilo', action: () => navigate('/profile') },
          ].map(a => (
            <button key={a.label} className="action-btn" onClick={a.action}>
              <span className="action-emoji">{a.emoji}</span>
              <span className="action-label">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {allAlerts.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">✅</div>
          <div className="empty-text">Tutto sotto controllo!</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nessuna scadenza imminente</div>
        </div>
      )}
    </div>
  );
}
