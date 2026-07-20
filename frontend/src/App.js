import React from 'react';
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
  return (
    <UiProvider>
      <AuthProvider>
        <Router>
          <div className="app-shell">
            <Navbar />
            <main className="app-main">
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
          <ToastViewport />
        </Router>
      </AuthProvider>
    </UiProvider>
  );
}

export default App;