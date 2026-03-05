import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Compila tutti i campi');
    setLoading(true); setError('');
    try { await login(email.trim().toLowerCase(), password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Credenziali non valide'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-logo">🥬</div>
        <h1 className="auth-title">La tua dispensa</h1>
        <p className="auth-subtitle">Tieni traccia di tutto il cibo in casa</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
      </form>
      <p className="auth-footer">Non hai un account? <Link to="/register">Registrati</Link></p>
    </div>
  );
}
