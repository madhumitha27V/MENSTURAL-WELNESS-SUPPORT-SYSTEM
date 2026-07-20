import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../lib/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-hero">
          <div>
            <div className="eyebrow">Secure access</div>
            <h1 className="auth-title">Welcome back to your wellness operations hub.</h1>
            <p className="hero-subtitle">
              Continue tracking, reviewing trends, and using the assistant from a polished workspace designed for clarity and calm.
            </p>
          </div>

          <div className="auth-hero__art" aria-hidden="true" />

          <div className="chips">
            <div className="pill">Predictive insights</div>
            <div className="pill">Private tracking</div>
            <div className="pill">Accessible by design</div>
          </div>
        </section>

        <section className="auth-body">
          <div className="auth-meta">
            <div>
              <div className="brand__eyebrow">Sign in</div>
              <h2 className="section-card__title">Return to your account</h2>
            </div>
          </div>

          {error && <div className="toast toast--error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="field__label" htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required className="field__input" />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">Password</label>
              <input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required className="field__input" />
            </div>

            <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="helper-text">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="nav-link" style={{ display: 'inline-flex', padding: 0, background: 'none' }}>
              Register here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;