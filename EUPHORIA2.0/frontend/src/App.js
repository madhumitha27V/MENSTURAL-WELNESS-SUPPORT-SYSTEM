import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PreCycle from './pages/PreCycle';
import PreData from './pages/PreData';
import During from './pages/During';
import Food from './pages/Food';
import Calendar from './pages/Calendar';
import SymptomSuggestions from './pages/SymptomSuggestions';
import ActiveCycleSuggestions from './pages/ActiveCycleSuggestions';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pre-cycle" element={<PreCycle />} />
          <Route path="/pre-data" element={<PreData />} />
          <Route path="/during" element={<During />} />
          <Route path="/food" element={<Food />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/suggestions" element={<SymptomSuggestions />} />
          <Route path="/active-suggestions" element={<ActiveCycleSuggestions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
