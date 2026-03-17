import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SymptomSuggestions.css';

function ActiveCycleSuggestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cycleData, setCycleData] = useState({
    physical: [],
    painLevel: 0,
    flowLevel: '',
    mood: '',
    location: '',
    waterIntake: '',
    sleepHours: '',
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (location.state?.symptoms) {
      setCycleData(location.state.symptoms);
    }
  }, [navigate, location]);

  const getSuggestions = () => {
    const suggestions = [];
    const { physical, painLevel, flowLevel, mood, location: userLocation, waterIntake, sleepHours } = cycleData;

    // Location-specific suggestions
    if (userLocation === 'home') {
      suggestions.push({
        icon: '🛁',
        title: 'Take a Warm Bath',
        description: 'Since you\'re at home, enjoy a relaxing warm bath with Epsom salts to ease cramps and relax muscles.',
        category: 'Location-Based Relief'
      });
      suggestions.push({
        icon: '🛋️',
        title: 'Rest Comfortably',
        description: 'Take advantage of being home - lie down with a heating pad and your favorite show or book.',
        category: 'Location-Based Relief'
      });
    } else if (userLocation === 'work' || userLocation === 'school') {
      suggestions.push({
        icon: '🧊',
        title: 'Portable Heat Pack',
        description: 'Use adhesive heat patches that can be worn discreetly under your clothes for pain relief.',
        category: 'Location-Based Relief'
      });
      suggestions.push({
        icon: '⏰',
        title: 'Take Regular Breaks',
        description: 'Step away from your desk every hour for gentle stretching and movement.',
        category: 'Location-Based Relief'
      });
      suggestions.push({
        icon: '🎒',
        title: 'Emergency Kit',
        description: 'Keep extra pads/tampons, pain relievers, and snacks in your bag or locker.',
        category: 'Preparation'
      });
    } else if (userLocation === 'gym') {
      suggestions.push({
        icon: '🏃‍♀️',
        title: 'Low-Impact Exercise',
        description: 'Stick to walking, swimming, or gentle yoga. Avoid intense workouts if cramping is severe.',
        category: 'Location-Based Relief'
      });
      suggestions.push({
        icon: '💧',
        title: 'Extra Hydration',
        description: 'Drink more water than usual during exercise to prevent dehydration and bloating.',
        category: 'Hydration'
      });
    } else if (userLocation === 'traveling') {
      suggestions.push({
        icon: '💊',
        title: 'Travel Medication',
        description: 'Keep pain relievers easily accessible in your carry-on or purse.',
        category: 'Location-Based Relief'
      });
      suggestions.push({
        icon: '🧳',
        title: 'Extra Supplies',
        description: 'Pack more menstrual products than you think you\'ll need for unexpected changes.',
        category: 'Preparation'
      });
    }

    // Flow level suggestions
    if (flowLevel === 'heavy') {
      suggestions.push({
        icon: '🩸',
        title: 'Overnight Protection',
        description: 'Use overnight pads or menstrual cups for better protection during heavy flow days.',
        category: 'Flow Management'
      });
      suggestions.push({
        icon: '🍖',
        title: 'Iron-Rich Foods',
        description: 'Eat red meat, spinach, and lentils to replenish iron lost during heavy bleeding.',
        category: 'Nutrition'
      });
      suggestions.push({
        icon: '⏱️',
        title: 'Frequent Changes',
        description: 'Change pads/tampons every 2-3 hours to prevent leakage and maintain hygiene.',
        category: 'Flow Management'
      });
    } else if (flowLevel === 'moderate') {
      suggestions.push({
        icon: '🌸',
        title: 'Regular Protection',
        description: 'Regular pads or tampons should be sufficient. Change every 4-6 hours.',
        category: 'Flow Management'
      });
    } else if (flowLevel === 'light' || flowLevel === 'spotting') {
      suggestions.push({
        icon: '🌿',
        title: 'Light Protection',
        description: 'Panty liners or light pads are perfect for lighter days.',
        category: 'Flow Management'
      });
    }

    // Mood-based suggestions
    if (mood === 'sad' || mood === 'anxious') {
      suggestions.push({
        icon: '🎵',
        title: 'Uplifting Music',
        description: 'Create a playlist of your favorite upbeat songs to boost your mood naturally.',
        category: 'Mood Enhancement'
      });
      suggestions.push({
        icon: '☀️',
        title: 'Get Some Sunlight',
        description: 'Spend 15-20 minutes outdoors. Sunlight helps improve mood and energy levels.',
        category: 'Mood Enhancement'
      });
    } else if (mood === 'irritated') {
      suggestions.push({
        icon: '🧘‍♀️',
        title: 'Breathing Exercises',
        description: 'Practice 5-10 minutes of deep breathing to calm irritability and tension.',
        category: 'Mood Enhancement'
      });
      suggestions.push({
        icon: '🎨',
        title: 'Creative Outlet',
        description: 'Try journaling, drawing, or another creative activity to express your feelings.',
        category: 'Mood Enhancement'
      });
    }

    // Water intake feedback
    if (waterIntake && waterIntake < 6) {
      suggestions.push({
        icon: '💧',
        title: 'Increase Water Intake',
        description: 'You\'re below the recommended 8 glasses. Hydration helps reduce bloating and fatigue.',
        category: 'Hydration'
      });
    } else if (waterIntake && waterIntake >= 8) {
      suggestions.push({
        icon: '✅',
        title: 'Great Hydration!',
        description: 'You\'re meeting your water goals! Keep it up for optimal comfort during your period.',
        category: 'Hydration'
      });
    }

    // Sleep feedback
    if (sleepHours && sleepHours < 7) {
      suggestions.push({
        icon: '😴',
        title: 'Prioritize Sleep',
        description: 'Aim for 7-9 hours tonight. Your body needs extra rest during menstruation.',
        category: 'Rest'
      });
    } else if (sleepHours && sleepHours >= 8) {
      suggestions.push({
        icon: '🌙',
        title: 'Excellent Sleep!',
        description: 'Great job getting enough rest! Quality sleep helps reduce pain and fatigue.',
        category: 'Rest'
      });
    }

    // Physical symptoms during active cycle
    if (physical.includes('Cramps')) {
      suggestions.push({
        icon: '🌡️',
        title: 'Heat Therapy',
        description: 'Apply heat to your lower abdomen. Heat helps relax cramping muscles during your period.',
        category: 'Pain Relief'
      });
      suggestions.push({
        icon: '💊',
        title: 'Pain Medication',
        description: 'Take ibuprofen or naproxen as directed to reduce cramps and inflammation.',
        category: 'Medication'
      });
    }

    if (physical.includes('Bloating')) {
      suggestions.push({
        icon: '🥗',
        title: 'Anti-Bloating Foods',
        description: 'Eat bananas, cucumbers, and papaya. Avoid salty and carbonated foods.',
        category: 'Nutrition'
      });
    }

    if (physical.includes('Headache')) {
      suggestions.push({
        icon: '🌙',
        title: 'Dark Room Rest',
        description: 'Rest in a dark, quiet room. Hormonal headaches respond well to reduced stimulation.',
        category: 'Pain Relief'
      });
    }

    if (physical.includes('Fatigue')) {
      suggestions.push({
        icon: '⚡',
        title: 'Energy Boost',
        description: 'Take short power naps (20-30 min) and eat small, frequent meals for sustained energy.',
        category: 'Energy'
      });
    }

    if (physical.includes('Nausea')) {
      suggestions.push({
        icon: '🍋',
        title: 'Ginger Relief',
        description: 'Drink ginger tea or eat ginger candies to naturally ease nausea during your period.',
        category: 'Natural Remedies'
      });
    }

    if (physical.includes('Back Pain')) {
      suggestions.push({
        icon: '🧊',
        title: 'Alternate Heat & Ice',
        description: 'Use heat for muscle tension and ice for inflammation. Alternate every 15 minutes.',
        category: 'Pain Relief'
      });
    }

    if (physical.includes('Cold')) {
      suggestions.push({
        icon: '🤧',
        title: 'Rest & Warmth',
        description: 'Your immune system may be weaker during menstruation. Stay warm, get extra rest, and drink warm fluids.',
        category: 'Natural Remedies'
      });
      suggestions.push({
        icon: '🍵',
        title: 'Immune-Boosting Tea',
        description: 'Drink ginger-lemon tea with honey to soothe cold symptoms and boost immunity naturally.',
        category: 'Natural Remedies'
      });
      suggestions.push({
        icon: '🥣',
        title: 'Nutritious Soup',
        description: 'Have warm chicken or vegetable soup with garlic for immune support and comfort.',
        category: 'Nutrition'
      });
      suggestions.push({
        icon: '💊',
        title: 'Vitamin C',
        description: 'Increase vitamin C intake through oranges, kiwis, or supplements to help fight the cold.',
        category: 'Nutrition'
      });
    }

    // Pain level specific for active cycle
    if (painLevel >= 8) {
      suggestions.push({
        icon: '🏥',
        title: 'Seek Medical Help',
        description: 'Severe pain during your period may indicate conditions like endometriosis. Consult your doctor.',
        category: 'Medical Attention'
      });
    } else if (painLevel >= 5) {
      suggestions.push({
        icon: '🛌',
        title: 'Rest and Recover',
        description: 'Don\'t push yourself. Take it easy and allow your body to rest during this time.',
        category: 'Self-Care'
      });
    }

    // General active cycle tips
    suggestions.push({
      icon: '🍫',
      title: 'Dark Chocolate',
      description: 'A small piece of dark chocolate can help with cravings and provides magnesium for cramp relief.',
      category: 'Self-Care'
    });

    // Exercise recommendations based on pain level
    if (painLevel <= 3) {
      suggestions.push({
        icon: '🧘‍♀️',
        title: 'Yoga & Stretching',
        description: 'Try gentle yoga poses like Child\'s Pose, Cat-Cow, and Supine Twist to ease discomfort and improve flexibility.',
        category: 'Exercise'
      });
      suggestions.push({
        icon: '🚶‍♀️',
        title: 'Light Walking',
        description: '20-30 minutes of walking boosts endorphins, reduces cramps, and improves mood naturally.',
        category: 'Exercise'
      });
      suggestions.push({
        icon: '🏊‍♀️',
        title: 'Swimming',
        description: 'Low-impact water exercises are gentle on your body while providing great cardiovascular benefits.',
        category: 'Exercise'
      });
    } else if (painLevel <= 5) {
      suggestions.push({
        icon: '🧘‍♀️',
        title: 'Gentle Yoga',
        description: 'Focus on restorative yoga with poses like Child\'s Pose, Legs-Up-the-Wall, and gentle twists for cramp relief.',
        category: 'Exercise'
      });
      suggestions.push({
        icon: '🚶‍♀️',
        title: 'Short Walks',
        description: 'Even 10-15 minutes of slow walking can improve circulation and reduce cramping without overexertion.',
        category: 'Exercise'
      });
      suggestions.push({
        icon: '🫁',
        title: 'Breathing Exercises',
        description: 'Practice deep belly breathing for 5-10 minutes to relax muscles and reduce pain perception.',
        category: 'Exercise'
      });
    } else if (painLevel <= 7) {
      suggestions.push({
        icon: '🧘‍♀️',
        title: 'Restorative Stretches',
        description: 'Simple stretches in bed: knee-to-chest, gentle spinal twists, and pelvic tilts can provide relief.',
        category: 'Exercise'
      });
      suggestions.push({
        icon: '🫁',
        title: 'Breathing & Meditation',
        description: 'Focus on mindful breathing and meditation to manage pain without physical movement.',
        category: 'Exercise'
      });
    } else {
      // For severe pain (8+), rest is prioritized over exercise
      suggestions.push({
        icon: '🛌',
        title: 'Rest is Best',
        description: 'With severe pain, your body needs rest. Skip exercise today and focus on heat therapy and medication.',
        category: 'Exercise'
      });
    }

    // Additional exercise tips
    suggestions.push({
      icon: '💪',
      title: 'Listen to Your Body',
      description: 'It\'s okay to skip intense workouts. Modify exercises based on how you feel each day of your period.',
      category: 'Exercise'
    });

    if (flowLevel === 'heavy') {
      suggestions.push({
        icon: '🩱',
        title: 'Choose Dark Workout Clothes',
        description: 'Wear dark-colored leggings or use period-proof underwear for worry-free exercise during heavy flow days.',
        category: 'Exercise'
      });
    }

    suggestions.push({
      icon: '🚶‍♀️',
      title: 'Gentle Movement',
      description: 'Light walking can reduce cramps by improving blood circulation. Don\'t stay sedentary too long.',
      category: 'Physical Activity'
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
          <h1>💡 Active Cycle Support</h1>
          <p>Helpful tips for managing your period right now</p>
        </header>

        <div className="content-body">
          <div className="symptoms-summary">
            <h2>Today's Status</h2>
            <div className="summary-grid">
              {cycleData.flowLevel && (
                <div className="summary-card">
                  <h3>🩸 Flow Level</h3>
                  <div className="symptom-tags">
                    <span className="symptom-tag flow" style={{ textTransform: 'capitalize' }}>
                      {cycleData.flowLevel}
                    </span>
                  </div>
                </div>
              )}
              {cycleData.mood && (
                <div className="summary-card">
                  <h3>😊 Mood</h3>
                  <div className="symptom-tags">
                    <span className="symptom-tag mood" style={{ textTransform: 'capitalize' }}>
                      {cycleData.mood}
                    </span>
                  </div>
                </div>
              )}
              {cycleData.location && (
                <div className="summary-card">
                  <h3>📍 Location</h3>
                  <div className="symptom-tags">
                    <span className="symptom-tag location" style={{ textTransform: 'capitalize' }}>
                      {cycleData.location}
                    </span>
                  </div>
                </div>
              )}
              {cycleData.physical && cycleData.physical.length > 0 && (
                <div className="summary-card">
                  <h3>🩺 Physical Symptoms</h3>
                  <div className="symptom-tags">
                    {cycleData.physical.map((symptom, index) => (
                      <span key={index} className="symptom-tag physical">{symptom}</span>
                    ))}
                  </div>
                </div>
              )}
              {cycleData.painLevel > 0 && (
                <div className="summary-card">
                  <h3>⚡ Pain Level</h3>
                  <div className="pain-indicator">
                    <div className="pain-bar">
                      <div 
                        className="pain-fill" 
                        style={{ 
                          width: `${cycleData.painLevel * 10}%`,
                          background: cycleData.painLevel <= 3 ? '#22c55e' : cycleData.painLevel <= 6 ? '#eab308' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    <span className="pain-value">{cycleData.painLevel}/10</span>
                  </div>
                </div>
              )}
              {cycleData.waterIntake && (
                <div className="summary-card">
                  <h3>💧 Water Intake</h3>
                  <div className="symptom-tags">
                    <span className="symptom-tag hydration">
                      {cycleData.waterIntake} glasses
                    </span>
                  </div>
                </div>
              )}
              {cycleData.sleepHours && (
                <div className="summary-card">
                  <h3>😴 Sleep</h3>
                  <div className="symptom-tags">
                    <span className="symptom-tag sleep">
                      {cycleData.sleepHours} hours
                    </span>
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
              <p>Track your symptoms to get personalized suggestions!</p>
            </div>
          )}

          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => navigate('/during')}>
              Track More Data
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

export default ActiveCycleSuggestions;
