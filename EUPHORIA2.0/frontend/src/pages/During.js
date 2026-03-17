import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './During.css';

function During() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    flowLevel: '',
    painLevel: '',
    mood: '',
    symptoms: [],
    location: '',
    waterIntake: '',
    sleepHours: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSymptomToggle = (symptom) => {
    setFormData({
      ...formData,
      symptoms: formData.symptoms.includes(symptom)
        ? formData.symptoms.filter(s => s !== symptom)
        : [...formData.symptoms, symptom]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Save to database
      await axios.post(
        'http://localhost:5000/api/active-cycle/track',
        {
          date: formData.date,
          flowLevel: formData.flowLevel,
          painLevel: parseInt(formData.painLevel) || 0,
          mood: formData.mood,
          symptoms: formData.symptoms,
          location: formData.location,
          waterIntake: parseInt(formData.waterIntake) || 0,
          sleepHours: parseFloat(formData.sleepHours) || 0,
          notes: formData.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Data saved successfully!');
      
      // Navigate to active cycle suggestions page with data
      setTimeout(() => {
        navigate('/active-suggestions', {
          state: {
            symptoms: {
              physical: formData.symptoms,
              emotional: [],
              painLevel: parseInt(formData.painLevel) || 0,
              notes: formData.notes,
              flowLevel: formData.flowLevel,
              mood: formData.mood,
              location: formData.location,
              waterIntake: formData.waterIntake,
              sleepHours: formData.sleepHours
            }
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Error saving data:', error);
      setMessage('Error saving data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="during-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>EUPHORIA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
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
          <h1>❤️ Active Cycle Tracking</h1>
          <p>Monitor your daily experience and symptoms</p>
        </header>

        <div className="content-body">
        <form onSubmit={handleSubmit} className="during-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="flowLevel">Flow Level</label>
              <select
                id="flowLevel"
                name="flowLevel"
                value={formData.flowLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select flow level</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
                <option value="spotting">Spotting</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="painLevel">Pain Level (1-10)</label>
              <input
                type="range"
                id="painLevel"
                name="painLevel"
                value={formData.painLevel}
                onChange={handleChange}
                min="0"
                max="10"
                className="pain-slider"
              />
              <span className="pain-value">{formData.painLevel || 0}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mood">Mood Today</label>
            <select
              id="mood"
              name="mood"
              value={formData.mood}
              onChange={handleChange}
            >
              <option value="">Select your mood</option>
              <option value="great">😊 Great</option>
              <option value="good">🙂 Good</option>
              <option value="okay">😐 Okay</option>
              <option value="sad">😢 Sad</option>
              <option value="irritated">😤 Irritated</option>
              <option value="anxious">😰 Anxious</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Current Location</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">Select your location</option>
              <option value="home">🏠 Home</option>
              <option value="work">🏢 Work</option>
              <option value="school">🏫 School</option>
              <option value="gym">🏋️ Gym</option>
              <option value="outdoors">🌳 Outdoors</option>
              <option value="traveling">✈️ Traveling</option>
              <option value="other">📍 Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Symptoms</label>
            <div className="symptoms-grid">
              {['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Nausea', 'Back Pain', 'Breast Tenderness', 'Acne', 'Cold'].map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  className={`symptom-btn ${formData.symptoms.includes(symptom) ? 'active' : ''}`}
                  onClick={() => handleSymptomToggle(symptom)}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="waterIntake">Water Intake (glasses)</label>
              <input
                type="number"
                id="waterIntake"
                name="waterIntake"
                value={formData.waterIntake}
                onChange={handleChange}
                placeholder="8"
                min="0"
                max="20"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sleepHours">Sleep Hours</label>
              <input
                type="number"
                id="sleepHours"
                name="sleepHours"
                value={formData.sleepHours}
                onChange={handleChange}
                placeholder="8"
                min="0"
                max="24"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Daily Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="How are you feeling today?"
              rows="4"
            />
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save & Get Suggestions'}
          </button>
        </form>
        </div>
      </main>
    </div>
  );
}

export default During;
