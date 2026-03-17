import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PreData.css';

function PreData() {
  const navigate = useNavigate();
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [nextPeriodDate, setNextPeriodDate] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCycleData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/cycle/data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const startDate = response.data.period_start_date || response.data.last_period_date;
        if (startDate) {
          setLastPeriodDate(startDate.split('T')[0]);
        }
        setCycleLength(response.data.cycle_length);
        
        // Calculate next period and days remaining
        const result = calculateNextPeriod(startDate.split('T')[0], response.data.cycle_length);
        setNextPeriodDate(result.nextDate);
        setDaysRemaining(result.daysRemaining);
      }
    } catch (error) {
      console.log('No previous cycle data found');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCycleData();
  }, [navigate, loadCycleData]);

  const calculateNextPeriod = (lastDate, length) => {
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(last.getDate() + parseInt(length));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(next);
    nextDate.setHours(0, 0, 0, 0);
    
    const timeDiff = nextDate - today;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return {
      nextDate: next.toISOString().split('T')[0],
      daysRemaining: days
    };
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    console.log('Date:', lastPeriodDate, 'Cycle Length:', cycleLength);
    
    if (!lastPeriodDate || !cycleLength) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage(''); // Clear previous message
    const result = calculateNextPeriod(lastPeriodDate, cycleLength);
    setNextPeriodDate(result.nextDate);
    setDaysRemaining(result.daysRemaining);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/cycle/track',
        {
          period_start_date: lastPeriodDate,
          cycle_length: parseInt(cycleLength)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Response:', response.data);
      setMessage('Cycle data saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving cycle data:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="pre-data">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>EUPHORIA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </button>
          
          <button className="nav-item" onClick={() => navigate('/calendar')}>
            <span className="nav-icon">📆</span>
            <span>Calendar</span>
          </button>
          
          <button className="nav-item active">
            <span className="nav-icon">📊</span>
            <span>Pre-Cycle</span>
          </button>
          
          <button className="nav-item" onClick={() => navigate('/pre-cycle')}>
            <span className="nav-icon">🩺</span>
            <span>Symptoms</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>📊 Pre-Cycle Planning</h1>
          <p>Track your menstrual cycle and get predictions</p>
        </header>

        <div className="content-body">
          <div className="tracker-card">
            <h2>🔄 Cycle Information</h2>
            
            <form onSubmit={handleCalculate} className="input-section">
              <div className="input-group">
                <label>Last Period Start Date</label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="input-group">
                <label>Average Cycle Length (days)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  min="20"
                  max="45"
                  placeholder="28"
                  required
                />
              </div>

              <button type="submit" className="calculate-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Calculate & Save'}
              </button>
            </form>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {nextPeriodDate && daysRemaining !== null && (
              <div className="results-section">
                <div className="result-card next-date">
                  <div className="result-icon">📅</div>
                  <div className="result-content">
                    <h3>Next Period Expected</h3>
                    <p className="result-value">{new Date(nextPeriodDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>

                <div className="result-card days-remaining">
                  <div className="result-icon">⏰</div>
                  <div className="result-content">
                    <h3>Days Remaining</h3>
                    <p className="result-value">{daysRemaining} days</p>
                    {daysRemaining <= 7 && daysRemaining > 0 && (
                      <span className="warning-badge">Coming Soon!</span>
                    )}
                    {daysRemaining === 0 && (
                      <span className="alert-badge">Today!</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PreData;
