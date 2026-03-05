import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Compila tutti i campi');
    if (password.length < 8) return setError('Password minimo 8 caratteri');
    setLoading(true); setError('');
    try { await register(email.trim().toLowerCase(), password, name.trim()); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Errore registrazione'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">🥬</div>
        <h1 className="auth-title">Crea account</h1>
        <p className="auth-subtitle">La tua dispensa personale ti aspetta</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Nome</label>
          <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Il tuo nome" />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 8 caratteri" />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Registrazione...' : 'Registrati'}
        </button>
      </form>
      <p className="auth-footer">Hai già un account? <Link to="/login">Accedi</Link></p>
    </div>
  );
}
