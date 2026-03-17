import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
      return;
    }

    // Test API connection
    axios.get('/api/health')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('Error connecting to backend:', error);
        setMessage('Backend connection failed');
      });
  }, [navigate]);

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="nav-brand">EUPHORIA</div>
        <div className="nav-links">
          <Link to="/login" className="nav-button secondary">Login</Link>
          <Link to="/signup" className="nav-button primary">Sign Up</Link>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">EUPHORIA</span>
          </h1>
          <p className="hero-subtitle">
            Your next-generation web application platform
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="hero-button primary">
              Get Started
            </Link>
            <Link to="/login" className="hero-button secondary">
              Login
            </Link>
          </div>
          {message && (
            <div className="status-indicator">
              <span className={message.includes('failed') ? 'status-dot offline' : 'status-dot online'}></span>
              Backend: {message}
            </div>
          )}
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Fast & Modern</h3>
            <p>Built with the latest technologies for optimal performance</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Enterprise-grade security with JWT authentication</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Beautiful UI</h3>
            <p>Stunning design with smooth animations and transitions</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Optimized for speed and user experience</p>
          </div>
        </div>
      </div>

      <footer className="home-footer">
        <p>&copy; 2026 EUPHORIA. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
