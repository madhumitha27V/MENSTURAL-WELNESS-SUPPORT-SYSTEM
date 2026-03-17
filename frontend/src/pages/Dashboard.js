import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">EUPHORIA</div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {user.name}! 🎉</h1>
          <p>You're successfully logged in to EUPHORIA</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate('/pre-data')}>
            <div className="card-icon">📅</div>
            <h3>Pre-Cycle</h3>
            <p>Plan and prepare</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/during')}>
            <div className="card-icon">❤️</div>
            <h3>Active Cycle</h3>
            <p>Track your experience</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/food')}>
            <div className="card-icon">🍽️</div>
            <h3>Nutrient Diet</h3>
            <p>Meal recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
