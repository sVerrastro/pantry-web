import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Vuoi davvero uscire?')) logout();
  };

  return (
    <div>
      <div className="profile-avatar">
        <div className="avatar-emoji">👤</div>
        <h1 className="avatar-name">{user?.name}</h1>
        <p className="avatar-email">{user?.email}</p>
      </div>

      <div style={{ padding: '0 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Inventario</p>
        <div className="card" style={{ marginBottom: 20 }}>
          {[
            { emoji: '📦', label: 'Tutti gli alimenti', action: () => navigate('/pantry') },
            { emoji: '⚠️', label: 'In scadenza', sub: 'Items che scadono presto', action: () => navigate('/pantry?filter=expiring') },
            { emoji: '🧊', label: 'Freezer', sub: 'Alimenti congelati', action: () => navigate('/pantry?filter=frozen') },
          ].map(item => (
            <div key={item.label} className="menu-item" onClick={item.action}>
              <span className="menu-emoji">{item.emoji}</span>
              <div className="menu-info">
                <div className="menu-label">{item.label}</div>
                {item.sub && <div className="menu-sub">{item.sub}</div>}
              </div>
              <span className="menu-arrow">›</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Prossimamente</p>
        <div className="card" style={{ marginBottom: 20 }}>
          {[
            { emoji: '👨‍🍳', label: 'Consigliere ricette', sub: 'In sviluppo' },
            { emoji: '🔔', label: 'Notifiche push', sub: 'In sviluppo' },
          ].map(item => (
            <div key={item.label} className="menu-item" onClick={() => alert('Coming soon!')}>
              <span className="menu-emoji">{item.emoji}</span>
              <div className="menu-info">
                <div className="menu-label">{item.label}</div>
                <div className="menu-sub">{item.sub}</div>
              </div>
              <span className="menu-arrow">›</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="menu-item" onClick={handleLogout}>
            <span className="menu-emoji">🚪</span>
            <div className="menu-info"><div className="menu-label danger">Esci</div></div>
            <span className="menu-arrow">›</span>
          </div>
        </div>
      </div>

      <p className="version">Pantry v1.0.0</p>
    </div>
  );
}
