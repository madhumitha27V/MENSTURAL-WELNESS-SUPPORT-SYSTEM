import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PreCycle.css';

function PreCycle() {
  const navigate = useNavigate();
  const [physicalSymptoms, setPhysicalSymptoms] = useState([]);
  const [emotionalSymptoms, setEmotionalSymptoms] = useState([]);
  const [painLevel, setPainLevel] = useState(0);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handlePhysicalChange = (symptom) => {
    setPhysicalSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleEmotionalChange = (symptom) => {
    setEmotionalSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Save to database
      await axios.post(
        'http://localhost:5000/api/pre-cycle-symptoms/track',
        {
          date: new Date().toISOString().split('T')[0],
          physicalSymptoms: physicalSymptoms,
          emotionalSymptoms: emotionalSymptoms,
          painLevel: parseInt(painLevel),
          notes: notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Symptoms saved successfully!');
      
      // Navigate to suggestions page with symptom data
      setTimeout(() => {
        navigate('/suggestions', {
          state: {
            symptoms: {
              physical: physicalSymptoms,
              emotional: emotionalSymptoms,
              painLevel: parseInt(painLevel),
              notes: notes
            }
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Error saving symptoms:', error);
      setMessage('Error saving symptoms. Please try again.');
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
    <div className="pre-cycle">
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
          
          <button className="nav-item" onClick={() => navigate('/pre-data')}>
            <span className="nav-icon">📊</span>
            <span>Pre-Cycle</span>
          </button>
          
          <button className="nav-item active">
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
          <h1>🩺 Symptoms Tracker</h1>
          <p>Track your daily symptoms and how you're feeling</p>
        </header>

        <div className="content-body">
          <div className="tracker-card">
            <h2>📝 Daily Symptoms</h2>
            
            <form onSubmit={handleSubmit} className="symptoms-form">
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="symptoms-section">
                <h3>Physical Symptoms</h3>
                <div className="symptoms-grid">
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Cramps')}
                      onChange={() => handlePhysicalChange('Cramps')}
                    />
                    <span>Cramps</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Bloating')}
                      onChange={() => handlePhysicalChange('Bloating')}
                    />
                    <span>Bloating</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Headache')}
                      onChange={() => handlePhysicalChange('Headache')}
                    />
                    <span>Headache</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Breast Tenderness')}
                      onChange={() => handlePhysicalChange('Breast Tenderness')}
                    />
                    <span>Breast Tenderness</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Fatigue')}
                      onChange={() => handlePhysicalChange('Fatigue')}
                    />
                    <span>Fatigue</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Back Pain')}
                      onChange={() => handlePhysicalChange('Back Pain')}
                    />
                    <span>Back Pain</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Nausea')}
                      onChange={() => handlePhysicalChange('Nausea')}
                    />
                    <span>Nausea</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={physicalSymptoms.includes('Acne')}
                      onChange={() => handlePhysicalChange('Acne')}
                    />
                    <span>Acne</span>
                  </label>
                </div>
              </div>

              <div className="symptoms-section">
                <h3>Emotional Symptoms</h3>
                <div className="symptoms-grid">
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={emotionalSymptoms.includes('Mood Swings')}
                      onChange={() => handleEmotionalChange('Mood Swings')}
                    />
                    <span>Mood Swings</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={emotionalSymptoms.includes('Anxiety')}
                      onChange={() => handleEmotionalChange('Anxiety')}
                    />
                    <span>Anxiety</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={emotionalSymptoms.includes('Irritability')}
                      onChange={() => handleEmotionalChange('Irritability')}
                    />
                    <span>Irritability</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={emotionalSymptoms.includes('Depression')}
                      onChange={() => handleEmotionalChange('Depression')}
                    />
                    <span>Depression</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={emotionalSymptoms.includes('Stress')}
                      onChange={() => handleEmotionalChange('Stress')}
                    />
                    <span>Stress</span>
                  </label>
                  <label className="symptom-checkbox">
                    <input 
                      type="checkbox" 
                      checked={emotionalSymptoms.includes('Crying Spells')}
                      onChange={() => handleEmotionalChange('Crying Spells')}
                    />
                    <span>Crying Spells</span>
                  </label>
                </div>
              </div>

              <div className="input-group">
                <label>Pain Level (0-10): {painLevel}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(e.target.value)}
                  className="pain-slider"
                />
                <div className="pain-scale">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="input-group">
                <label>Additional Notes</label>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other symptoms or notes..."
                  className="notes-textarea"
                />
              </div>

              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="calculate-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save & Get Suggestions'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PreCycle;
