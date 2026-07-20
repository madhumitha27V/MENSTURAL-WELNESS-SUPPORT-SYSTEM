import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../lib/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-hero">
          <div>
            <div className="eyebrow">Create account</div>
            <h1 className="auth-title">Build a complete wellness workspace in a few steps.</h1>
            <p className="hero-subtitle">
              Join a polished, responsive product experience that combines scheduling, symptom tracking, and AI guidance.
            </p>
          </div>

          <div className="auth-hero__art" aria-hidden="true" />

          <div className="chips">
            <div className="pill">Onboarding</div>
            <div className="pill">Personalized tracking</div>
            <div className="pill">Clean analytics</div>
          </div>
        </section>

        <section className="auth-body">
          <div className="auth-meta">
            <div>
              <div className="brand__eyebrow">Register</div>
              <h2 className="section-card__title">Create your profile</h2>
            </div>
          </div>

          {error && <div className="toast toast--error">{error}</div>}
          {success && <div className="toast toast--success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="field__label" htmlFor="name">Full name</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className="field__input" />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="register-email">Email</label>
              <input id="register-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required className="field__input" />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="register-password">Password</label>
              <input id="register-password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required className="field__input" />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="age">Age</label>
              <input id="age" type="number" name="age" value={form.age} onChange={handleChange} placeholder="Your age" className="field__input" />
            </div>

            <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: '100%' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="helper-text">
            Already have an account?{' '}
            <Link to="/login" className="nav-link" style={{ display: 'inline-flex', padding: 0, background: 'none' }}>
              Sign in here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;