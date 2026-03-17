import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SymptomSuggestions.css';

function SymptomSuggestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [symptoms, setSymptoms] = useState({ physical: [], emotional: [], painLevel: 0, notes: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (location.state?.symptoms) {
      setSymptoms(location.state.symptoms);
    }
  }, [navigate, location]);

  const getSuggestions = () => {
    const suggestions = [];
    const { physical, emotional, painLevel } = symptoms;

    // Pre-cycle preparation tips
    suggestions.push({
      icon: '📋',
      title: 'Prepare Supplies',
      description: 'Stock up on pads, tampons, or menstrual cups before your period starts.',
      category: 'Preparation'
    });

    // Physical symptom suggestions (PMS focused)
    if (physical.includes('Cramps')) {
      suggestions.push({
        icon: '🌡️',
        title: 'Pre-emptive Heat Therapy',
        description: 'Start using heating pads now to prevent severe cramping when your period begins.',
        category: 'Prevention'
      });
      suggestions.push({
        icon: '🥬',
        title: 'Magnesium-Rich Foods',
        description: 'Eat dark leafy greens, nuts, and seeds to reduce pre-menstrual cramping.',
        category: 'Nutrition'
      });
    }

    if (physical.includes('Bloating')) {
      suggestions.push({
        icon: '💧',
        title: 'Reduce Water Retention',
        description: 'Drink plenty of water and reduce sodium intake to minimize pre-period bloating.',
        category: 'Hydration'
      });
      suggestions.push({
        icon: '🍵',
        title: 'Herbal Tea',
        description: 'Drink dandelion or peppermint tea to help with bloating and water retention.',
        category: 'Natural Remedies'
      });
    }

    if (physical.includes('Headache')) {
      suggestions.push({
        icon: '💤',
        title: 'Sleep Schedule',
        description: 'Maintain consistent sleep patterns. Hormonal headaches worsen with poor sleep.',
        category: 'Prevention'
      });
      suggestions.push({
        icon: '🧘',
        title: 'Stress Management',
        description: 'Practice relaxation techniques to prevent tension headaches before your period.',
        category: 'Mental Health'
      });
    }

    if (physical.includes('Fatigue')) {
      suggestions.push({
        icon: '🍎',
        title: 'Energy-Boosting Foods',
        description: 'Eat complex carbs and protein to maintain stable energy levels during PMS.',
        category: 'Nutrition'
      });
      suggestions.push({
        icon: '☕',
        title: 'Moderate Caffeine',
        description: 'Limit caffeine intake as it can worsen PMS symptoms and disrupt sleep.',
        category: 'Diet'
      });
    }

    if (physical.includes('Breast Tenderness')) {
      suggestions.push({
        icon: '👙',
        title: 'Comfortable Clothing',
        description: 'Wear soft, supportive bras without underwires during the pre-menstrual phase.',
        category: 'Comfort'
      });
      suggestions.push({
        icon: '🧊',
        title: 'Cold Compress',
        description: 'Apply cold compresses to tender areas for relief. Avoid hot water on breasts.',
        category: 'Physical Relief'
      });
    }

    if (physical.includes('Acne')) {
      suggestions.push({
        icon: '🧴',
        title: 'Skincare Routine',
        description: 'Use gentle, non-comedogenic products. Avoid touching your face frequently.',
        category: 'Skincare'
      });
      suggestions.push({
        icon: '💧',
        title: 'Hydration for Skin',
        description: 'Drink plenty of water to help flush toxins and keep skin clear.',
        category: 'Skincare'
      });
    }

    if (physical.includes('Nausea')) {
      suggestions.push({
        icon: '🍋',
        title: 'Ginger Tea',
        description: 'Drink ginger tea daily to prevent nausea as your period approaches.',
        category: 'Natural Remedies'
      });
    }

    if (physical.includes('Back Pain')) {
      suggestions.push({
        icon: '🧘‍♀️',
        title: 'Core Strengthening',
        description: 'Gentle core exercises and stretches can prevent pre-menstrual back pain.',
        category: 'Prevention'
      });
    }

    // Emotional symptom suggestions (PMS focused)
    if (emotional.includes('Mood Swings') || emotional.includes('Irritability')) {
      suggestions.push({
        icon: '🏃‍♀️',
        title: 'Regular Exercise',
        description: 'Exercise releases endorphins that stabilize mood during PMS. Try 30 minutes daily.',
        category: 'Mental Health'
      });
      suggestions.push({
        icon: '🍫',
        title: 'Dark Chocolate',
        description: 'Small amounts of dark chocolate (70%+) can boost serotonin and improve PMS mood swings.',
        category: 'Nutrition'
      });
      suggestions.push({
        icon: '📅',
        title: 'Track Your Cycle',
        description: 'Understanding your cycle helps you anticipate mood changes and plan accordingly.',
        category: 'Self-Awareness'
      });
    }

    if (emotional.includes('Anxiety') || emotional.includes('Stress')) {
      suggestions.push({
        icon: '🧘‍♀️',
        title: 'Daily Meditation',
        description: 'Practice 10-15 minutes of meditation to reduce pre-menstrual anxiety.',
        category: 'Mental Health'
      });
      suggestions.push({
        icon: '🌿',
        title: 'Adaptogenic Herbs',
        description: 'Consider ashwagandha or chamomile supplements (consult your doctor first).',
        category: 'Natural Remedies'
      });
      suggestions.push({
        icon: '📝',
        title: 'Journaling',
        description: 'Write down your thoughts and feelings to process emotions before your period.',
        category: 'Self-Care'
      });
    }

    if (emotional.includes('Depression') || emotional.includes('Crying Spells')) {
      suggestions.push({
        icon: '☀️',
        title: 'Vitamin D',
        description: 'Get sunlight exposure or consider vitamin D supplements to combat PMS-related depression.',
        category: 'Mental Health'
      });
      suggestions.push({
        icon: '💬',
        title: 'Social Support',
        description: 'Reach out to friends and family. Social connection helps reduce pre-menstrual depression.',
        category: 'Support'
      });
      suggestions.push({
        icon: '🎨',
        title: 'Creative Activities',
        description: 'Engage in hobbies you enjoy to boost mood before your period starts.',
        category: 'Self-Care'
      });
    }

    // Pain level suggestions for PMS
    if (painLevel >= 7) {
      suggestions.push({
        icon: '🏥',
        title: 'Medical Consultation',
        description: 'Severe PMS symptoms may indicate PMDD. Consider consulting a healthcare provider.',
        category: 'Medical'
      });
      suggestions.push({
        icon: '💊',
        title: 'Preventive Medication',
        description: 'Talk to your doctor about starting pain medication before symptoms worsen.',
        category: 'Medication'
      });
    } else if (painLevel >= 4) {
      suggestions.push({
        icon: '🌡️',
        title: 'Heat Packs Ready',
        description: 'Prepare heating pads or hot water bottles for when cramping intensifies.',
        category: 'Preparation'
      });
    }

    // General PMS management
    suggestions.push({
      icon: '🥦',
      title: 'Balanced Diet',
      description: 'Eat whole grains, lean proteins, and plenty of vegetables to balance hormones.',
      category: 'Nutrition'
    });

    suggestions.push({
      icon: '🚫',
      title: 'Limit Alcohol',
      description: 'Alcohol can worsen PMS symptoms like mood swings, bloating, and headaches.',
      category: 'Lifestyle'
    });

    suggestions.push({
      icon: '💪',
      title: 'Strength Training',
      description: 'Regular exercise throughout your cycle helps reduce PMS severity over time.',
      category: 'Lifestyle'
    });

    return suggestions;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const suggestions = getSuggestions();

  return (
    <div className="suggestions-page">
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
          <h1>💡 Pre-Cycle Management</h1>
          <p>Prepare and prevent symptoms before your period starts</p>
        </header>

        <div className="content-body">
          <div className="symptoms-summary">
            <h2>Your Symptoms</h2>
            <div className="summary-grid">
              {symptoms.physical.length > 0 && (
                <div className="summary-card">
                  <h3>🩺 Physical</h3>
                  <div className="symptom-tags">
                    {symptoms.physical.map((symptom, index) => (
                      <span key={index} className="symptom-tag physical">{symptom}</span>
                    ))}
                  </div>
                </div>
              )}
              {symptoms.emotional.length > 0 && (
                <div className="summary-card">
                  <h3>💭 Emotional</h3>
                  <div className="symptom-tags">
                    {symptoms.emotional.map((symptom, index) => (
                      <span key={index} className="symptom-tag emotional">{symptom}</span>
                    ))}
                  </div>
                </div>
              )}
              {symptoms.painLevel > 0 && (
                <div className="summary-card">
                  <h3>⚡ Pain Level</h3>
                  <div className="pain-indicator">
                    <div className="pain-bar">
                      <div 
                        className="pain-fill" 
                        style={{ 
                          width: `${symptoms.painLevel * 10}%`,
                          background: symptoms.painLevel <= 3 ? '#22c55e' : symptoms.painLevel <= 6 ? '#eab308' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    <span className="pain-value">{symptoms.painLevel}/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {suggestions.length > 0 ? (
            <div className="suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-card">
                  <div className="suggestion-icon">{suggestion.icon}</div>
                  <div className="suggestion-content">
                    <span className="suggestion-category">{suggestion.category}</span>
                    <h3>{suggestion.title}</h3>
                    <p>{suggestion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-suggestions">
              <p>No specific symptoms tracked. General wellness tips are always available!</p>
            </div>
          )}

          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => navigate('/pre-cycle')}>
              Track More Symptoms
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/calendar')}>
              View Calendar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SymptomSuggestions;
