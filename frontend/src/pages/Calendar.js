import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Calendar.css';

function Calendar() {
  const navigate = useNavigate();
  const [cycleData, setcycleData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const loadCycleData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Try to load from backend, but if it fails, just show empty calendar
      try {
        const response = await axios.get('http://localhost:5000/api/cycle/data', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.data) {
          setcycleData(response.data.data);
        }
      } catch (backendError) {
        // Backend not available, just show empty calendar
        console.log('Backend not available, showing empty calendar');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cycle data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Allow calendar to open even without authentication
    const token = localStorage.getItem('token');
    if (!token) {
      // Show empty calendar if not logged in
      setLoading(false);
      return;
    }
    
    loadCycleData();
  }, [navigate, loadCycleData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isPeriodDay = (day) => {
    if (!cycleData) return false;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const lastPeriod = new Date(cycleData.period_start_date);
    
    // Calculate multiple period cycles
    const cycleLength = cycleData.cycle_length || 28;
    const periodLength = 5; // Period lasts 5 days
    
    // Check current and future cycles (up to 12 months ahead - approximately 13 cycles)
    for (let cycle = 0; cycle < 13; cycle++) {
      const periodStart = new Date(lastPeriod);
      periodStart.setDate(lastPeriod.getDate() + (cycle * cycleLength));
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + periodLength);
      
      if (checkDate >= periodStart && checkDate < periodEnd) {
        return true;
      }
    }
    
    // Also check previous cycles (up to 12 months back - approximately 13 cycles)
    for (let cycle = 1; cycle <= 13; cycle++) {
      const periodStart = new Date(lastPeriod);
      periodStart.setDate(lastPeriod.getDate() - (cycle * cycleLength));
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + periodLength);
      
      if (checkDate >= periodStart && checkDate < periodEnd) {
        return true;
      }
    }
    
    return false;
  };

  const isOvulationDay = (day) => {
    if (!cycleData) return false;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const lastPeriod = new Date(cycleData.period_start_date);
    const cycleLength = cycleData.cycle_length || 28;
    
    // Ovulation typically occurs 14 days before next period
    const ovulationDayInCycle = cycleLength - 14;
    const ovulationWindowDays = 3; // Mark 3 days as ovulation window (day before, day of, day after)
    
    // Check current and future cycles (up to 12 months ahead - approximately 13 cycles)
    for (let cycle = 0; cycle < 13; cycle++) {
      const ovulationDate = new Date(lastPeriod);
      ovulationDate.setDate(lastPeriod.getDate() + (cycle * cycleLength) + ovulationDayInCycle);
      
      // Mark ovulation window (3 days)
      for (let i = -1; i <= 1; i++) {
        const ovulationWindowDate = new Date(ovulationDate);
        ovulationWindowDate.setDate(ovulationDate.getDate() + i);
        
        if (checkDate.toDateString() === ovulationWindowDate.toDateString()) {
          return true;
        }
      }
    }
    
    // Also check previous cycles (up to 12 months back - approximately 13 cycles)
    for (let cycle = 1; cycle <= 13; cycle++) {
      const ovulationDate = new Date(lastPeriod);
      ovulationDate.setDate(lastPeriod.getDate() - (cycle * cycleLength) + ovulationDayInCycle);
      
      // Mark ovulation window (3 days)
      for (let i = -1; i <= 1; i++) {
        const ovulationWindowDate = new Date(ovulationDate);
        ovulationWindowDate.setDate(ovulationDate.getDate() + i);
        
        if (checkDate.toDateString() === ovulationWindowDate.toDateString()) {
          return true;
        }
      }
    }
    
    return false;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    dayNames.forEach(day => {
      days.push(<div key={`header-${day}`} className="calendar-day-header">{day}</div>);
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const classes = ['calendar-day'];
      if (isToday(day)) classes.push('today');
      if (isPeriodDay(day)) classes.push('period-day');
      if (isOvulationDay(day)) classes.push('ovulation-day');

      days.push(
        <div key={`day-${day}`} className={classes.join(' ')}>
          <span className="day-number">{day}</span>
          {isPeriodDay(day) && <span className="day-indicator">🩸</span>}
          {isOvulationDay(day) && <span className="day-indicator">🥚</span>}
        </div>
      );
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="calendar-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>EUPHORIA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </button>
          
          <button className="nav-item active">
            <span className="nav-icon">📆</span>
            <span>Calendar</span>
          </button>
          
          <button className="nav-item" onClick={() => navigate('/pre-data')}>
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
          <h1>📆 Cycle Calendar</h1>
          <p>Track your menstrual cycle and ovulation days</p>
        </header>

        <div className="content-body">
          {loading ? (
            <div className="loading-message">Loading calendar...</div>
          ) : (
            <>
              {cycleData && (
                <div className="calendar-info">
                  <div className="info-card">
                    <span className="info-icon">📅</span>
                    <div className="info-content">
                      <h3>Last Period</h3>
                      <p>{new Date(cycleData.period_start_date).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <span className="info-icon">⏰</span>
                    <div className="info-content">
                      <h3>Next Period</h3>
                      <p>{(() => {
                        const nextPeriod = new Date(cycleData.period_start_date);
                        nextPeriod.setDate(nextPeriod.getDate() + cycleData.cycle_length);
                        return nextPeriod.toLocaleDateString('en-US', { 
                          month: 'long', day: 'numeric', year: 'numeric' 
                        });
                      })()}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <span className="info-icon">🔄</span>
                    <div className="info-content">
                      <h3>Cycle Length</h3>
                      <p>{cycleData.cycle_length} days</p>
                    </div>
                  </div>
                </div>
              )}

              {!cycleData && (
                <div className="no-data-banner">
                  <p>📊 No cycle data yet. Track your cycle in the Pre Cycle page to see predictions!</p>
                  <button onClick={() => navigate('/pre-cycle')} className="track-btn-small">
                    Track Now
                  </button>
                </div>
              )}

              <div className="calendar-container">
                <div className="calendar-header">
                  <button onClick={() => changeMonth(-1)} className="month-nav">
                    ← Prev
                  </button>
                  <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <button onClick={() => changeMonth(1)} className="month-nav">
                    Next →
                  </button>
                </div>

                <div className="calendar-grid">
                  {renderCalendar()}
                </div>

                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-box today-box"></span>
                    <span>Today</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-box period-box"></span>
                    <span>Period Days 🩸</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-box ovulation-box"></span>
                    <span>Ovulation Day 🥚</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Calendar;
