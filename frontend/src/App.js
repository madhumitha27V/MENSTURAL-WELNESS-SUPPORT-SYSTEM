import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import Navbar from './components/Navbar';
import ToastViewport from './components/ToastViewport';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CycleTracker from './pages/CycleTracker';
import Symptoms from './pages/Symptoms';
import Chatbot from './pages/Chatbot';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [focusMode, setFocusMode] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const toggleFocusMode = () => setFocusMode((current) => !current);

  useEffect(() => {
    document.body.classList.toggle('focus-mode', focusMode);
  }, [focusMode]);

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll('.page__hero, .section-card, .metric-card, .quick-card, .log-card, .mini-panel, .chat-card, .auth-card, .modal, .drawer-panel, .toast'));

    revealTargets.forEach((element, index) => {
      element.classList.add('reveal-element');
      element.style.transitionDelay = `${Math.min(index * 40, 200)}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach((element) => observer.observe(element));

    const handleScroll = () => {
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        topbar.classList.toggle('topbar--compact', window.scrollY > 14);
      }
      setShowFab(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <UiProvider>
      <AuthProvider>
        <Router>
          <div className={`app-shell${focusMode ? ' app-shell--focus' : ''}`}>
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <Navbar focusMode={focusMode} toggleFocusMode={toggleFocusMode} />
            <main id="main-content" className="app-main">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/cycle" element={<PrivateRoute><CycleTracker /></PrivateRoute>} />
                <Route path="/symptoms" element={<PrivateRoute><Symptoms /></PrivateRoute>} />
                <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
          <button
            type="button"
            className={`fab ${showFab ? 'fab--visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            ↑
          </button>
          <ToastViewport />
        </Router>
      </AuthProvider>
    </UiProvider>
  );
}

export default App;