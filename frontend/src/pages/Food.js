import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Food.css';

function Food() {
  const navigate = useNavigate();
  const [cycleDay, setCycleDay] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const getCyclePhase = (day) => {
    const dayNum = parseInt(day);
    if (dayNum >= 1 && dayNum <= 5) return 'menstrual';
    if (dayNum >= 6 && dayNum <= 13) return 'follicular';
    if (dayNum >= 14 && dayNum <= 16) return 'ovulation';
    if (dayNum >= 17 && dayNum <= 28) return 'luteal';
    return null;
  };

  const getPhaseInfo = (phase) => {
    const phaseData = {
      menstrual: {
        name: 'Menstrual Phase',
        days: 'Days 1-5',
        description: 'Your period is here. Focus on replenishing lost nutrients and managing symptoms.',
        icon: '🩸',
        nutrients: [
          { name: 'Iron', icon: '🔴', amount: '18 mg/day', reason: 'Replenish blood loss' },
          { name: 'Vitamin C', icon: '🍊', amount: '75-90 mg/day', reason: 'Helps iron absorption' },
          { name: 'Omega-3', icon: '🐟', amount: '1.1-1.6 g/day', reason: 'Reduces inflammation and cramps' },
          { name: 'Magnesium', icon: '🥜', amount: '310-320 mg/day', reason: 'Relieves muscle tension' },
          { name: 'Zinc', icon: '🌰', amount: '8-11 mg/day', reason: 'Supports immune system' }
        ],
        avoid: [
          { name: 'Caffeine', icon: '☕', reason: 'Increases cramps and anxiety' },
          { name: 'Salty Foods', icon: '🧂', reason: 'Causes bloating and water retention' },
          { name: 'Alcohol', icon: '🍷', reason: 'Dehydrates and worsens cramps' },
          { name: 'Fried Foods', icon: '🍟', reason: 'Increases inflammation' }
        ]
      },
      follicular: {
        name: 'Follicular Phase',
        days: 'Days 6-13',
        description: 'Energy is rising! Support your body\'s rebuilding with protein and nutrients.',
        icon: '🌱',
        nutrients: [
          { name: 'Protein', icon: '🥚', amount: '46-56 g/day', reason: 'Build new tissue and energy' },
          { name: 'B Vitamins', icon: '🥑', amount: 'B6: 1.3 mg, B12: 2.4 mcg/day', reason: 'Support energy metabolism' },
          { name: 'Zinc', icon: '🦪', amount: '8-11 mg/day', reason: 'Hormone production' },
          { name: 'Vitamin E', icon: '🌰', amount: '15 mg/day', reason: 'Support egg development' },
          { name: 'Probiotics', icon: '🥛', amount: '1-10 billion CFU/day', reason: 'Gut health and hormone balance' }
        ],
        avoid: [
          { name: 'Heavy Processed Foods', icon: '🍔', reason: 'Disrupts hormone balance' },
          { name: 'Excess Sugar', icon: '🍰', reason: 'Causes energy crashes' }
        ]
      },
      ovulation: {
        name: 'Ovulation Phase',
        days: 'Days 14-16',
        description: 'Peak fertility and energy! Support hormone balance and inflammation control.',
        icon: '🥚',
        nutrients: [
          { name: 'Calcium', icon: '🥛', amount: '1000-1200 mg/day', reason: 'Hormone signaling' },
          { name: 'Vitamin B6', icon: '🐔', amount: '1.3-1.5 mg/day', reason: 'Progesterone production' },
          { name: 'Fiber', icon: '🥦', amount: '25-30 g/day', reason: 'Eliminate excess estrogen' },
          { name: 'Antioxidants', icon: '🍓', amount: 'Vitamin C: 75-90 mg/day', reason: 'Protect egg quality' },
          { name: 'Folate', icon: '🥬', amount: '400 mcg/day', reason: 'Cell division support' }
        ],
        avoid: [
          { name: 'High Sugar Foods', icon: '🍭', reason: 'Spikes insulin and disrupts hormones' },
          { name: 'Trans Fats', icon: '🍩', reason: 'Increases inflammation' }
        ]
      },
      luteal: {
        name: 'Luteal Phase',
        days: 'Days 17-28',
        description: 'PMS may start. Focus on mood-stabilizing and anti-inflammatory foods.',
        icon: '🌙',
        nutrients: [
          { name: 'Magnesium', icon: '🥜', amount: '310-360 mg/day', reason: 'Reduce anxiety and cravings' },
          { name: 'Vitamin B6', icon: '🥔', amount: '1.3-1.9 mg/day', reason: 'Support mood and reduce PMS' },
          { name: 'Complex Carbs', icon: '🍠', amount: '130-225 g/day', reason: 'Stabilize blood sugar and mood' },
          { name: 'Calcium', icon: '🥛', amount: '1000-1300 mg/day', reason: 'Reduce PMS symptoms' },
          { name: 'Vitamin D', icon: '☀️', amount: '600-800 IU/day', reason: 'Mood support' }
        ],
        avoid: [
          { name: 'Caffeine', icon: '☕', reason: 'Increases anxiety and breast tenderness' },
          { name: 'Refined Sugar', icon: '🍬', reason: 'Worsens mood swings' },
          { name: 'Excess Salt', icon: '🧂', reason: 'Increases bloating' },
          { name: 'Alcohol', icon: '🍷', reason: 'Disrupts mood and sleep' }
        ]
      }
    };

    return phaseData[phase];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const day = parseInt(cycleDay);
    if (day >= 1 && day <= 28) {
      setShowRecommendations(true);
    } else {
      alert('Please enter a valid cycle day (1-28)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const phase = getCyclePhase(cycleDay);
  const phaseInfo = phase ? getPhaseInfo(phase) : null;

  return (
    <div className="food-page">
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
          <h1>🍽️ Cycle-Based Nutrition</h1>
          <p>Get personalized food recommendations based on your cycle day</p>
        </header>

        <div className="content-body">
          {!showRecommendations ? (
            <div className="cycle-input-section">
              <div className="input-card">
                <h2>What day of your cycle are you on?</h2>
                <p className="helper-text">Day 1 is the first day of your period</p>
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label htmlFor="cycleDay">Cycle Day</label>
                    <input
                      type="number"
                      id="cycleDay"
                      min="1"
                      max="28"
                      value={cycleDay}
                      onChange={(e) => setCycleDay(e.target.value)}
                      placeholder="Enter day (1-28)"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Get Food Recommendations
                  </button>
                </form>

                <div className="cycle-guide">
                  <h3>Cycle Phase Guide:</h3>
                  <div className="phase-list">
                    <div className="phase-item">
                      <span className="phase-icon">🩸</span>
                      <div>
                        <strong>Menstrual (Days 1-5)</strong>
                        <p>Your period</p>
                      </div>
                    </div>
                    <div className="phase-item">
                      <span className="phase-icon">🌱</span>
                      <div>
                        <strong>Follicular (Days 6-13)</strong>
                        <p>Rising energy</p>
                      </div>
                    </div>
                    <div className="phase-item">
                      <span className="phase-icon">🥚</span>
                      <div>
                        <strong>Ovulation (Days 14-16)</strong>
                        <p>Peak fertility</p>
                      </div>
                    </div>
                    <div className="phase-item">
                      <span className="phase-icon">🌙</span>
                      <div>
                        <strong>Luteal (Days 17-28)</strong>
                        <p>PMS may occur</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : phaseInfo && (
            <div className="recommendations-section">
              <div className="phase-header">
                <span className="phase-icon-large">{phaseInfo.icon}</span>
                <div>
                  <h2>{phaseInfo.name}</h2>
                  <p className="phase-days">{phaseInfo.days}</p>
                  <p className="phase-description">{phaseInfo.description}</p>
                </div>
                <button 
                  className="change-day-btn" 
                  onClick={() => setShowRecommendations(false)}
                >
                  Change Day
                </button>
              </div>

              <div className="nutrients-section">
                <h3>🔬 Daily Nutrient Requirements for This Phase</h3>
                <div className="nutrients-grid">
                  {phaseInfo.nutrients.map((nutrient, index) => (
                    <div key={index} className="nutrient-card">
                      <span className="nutrient-icon">{nutrient.icon}</span>
                      <h4>{nutrient.name}</h4>
                      <p className="nutrient-amount">{nutrient.amount}</p>
                      <p className="nutrient-reason">{nutrient.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="avoid-section">
                <h3>⚠️ Foods to Avoid</h3>
                <div className="avoid-grid">
                  {phaseInfo.avoid.map((item, index) => (
                    <div key={index} className="avoid-card">
                      <span className="avoid-icon">{item.icon}</span>
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Food;
