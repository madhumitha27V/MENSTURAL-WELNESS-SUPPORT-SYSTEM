import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UiContext';
import api, { getApiErrorMessage, getAuthConfig } from '../lib/api';

const Chatbot = () => {
  const { token } = useAuth();
  const { notify } = useUI();
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am your personal wellness assistant 🌸 Ask me anything about your health and menstrual cycle!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptFilter, setPromptFilter] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMessage }, getAuthConfig(token));
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
      notify('Assistant response received.', 'success');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry I am having trouble connecting right now. Please try again later!' }]);
      notify(getApiErrorMessage(err, 'The assistant could not respond right now.'), 'warning');
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = useMemo(() => ([
    { label: 'Period relief', category: 'comfort', text: 'What can help with period cramps?' },
    { label: 'Fertility', category: 'planning', text: 'How do I track my fertile window?' },
    { label: 'Cycle regularity', category: 'analysis', text: 'Why is my cycle irregular?' },
    { label: 'Nutrition', category: 'comfort', text: 'What foods help during periods?' },
    { label: 'Mood support', category: 'wellbeing', text: 'How can I manage mood swings before my period?' },
    { label: 'Red flags', category: 'analysis', text: 'What symptoms mean I should seek medical advice?' },
  ]), []);

  const visibleQuestions = quickQuestions.filter((question) => promptFilter === 'all' || question.category === promptFilter);

  return (
    <div className="page chat-layout">
      <section className="chat-card">
        <div className="section-card__header">
          <div>
            <div className="eyebrow">AI assistant</div>
            <h1 className="hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Conversational wellness guidance</h1>
            <p className="hero-subtitle">A calm, focused interface for asking health questions with soft motion, quick prompts, and premium spacing.</p>
          </div>
        </div>

        <div className="chips">
          {quickQuestions.slice(0, 3).map((question) => (
            <button key={question.label} type="button" className="pill" onClick={() => setInput(question.text)}>
              {question.label}
            </button>
          ))}
        </div>

        <div className="chat-stream" role="log" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-message chat-message--${message.role === 'user' ? 'user' : 'assistant'}`}>
              <div className={`chat-bubble chat-bubble--${message.role === 'user' ? 'user' : 'assistant'}`}>
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-bubble chat-bubble--assistant">
                <div className="chips" aria-label="Assistant typing">
                  <span className="pill">Loading</span>
                  <span className="pill">Thinking</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-inputRow">
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about cramps, cycle timing, fertility, nutrition, or symptoms..."
            aria-label="Chat message input"
          />
          <button type="button" className="btn btn--primary" onClick={sendMessage} disabled={loading || !input.trim()}>
            Send message
          </button>
        </div>
      </section>

      <aside className="section-card section-card--narrow">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Prompt library</h2>
            <p className="section-card__subtitle">Filter the prompt set to the context you need.</p>
          </div>
        </div>

        <div className="control-bar">
          <select className="select" value={promptFilter} onChange={(event) => setPromptFilter(event.target.value)}>
            <option value="all">All topics</option>
            <option value="comfort">Comfort</option>
            <option value="planning">Planning</option>
            <option value="analysis">Analysis</option>
            <option value="wellbeing">Wellbeing</option>
          </select>
        </div>

        <div className="chip-grid">
          {visibleQuestions.map((question) => (
            <button key={question.label} type="button" className="quick-card" onClick={() => setInput(question.text)}>
              <div className="quick-card__icon">✦</div>
              <h3 className="quick-card__title">{question.label}</h3>
              <p className="quick-card__copy">{question.text}</p>
            </button>
          ))}
        </div>

        <div className="mini-panel">
          <h3 className="quick-card__title">Conversation guidance</h3>
          <p className="quick-card__copy">
            Ask one focused question at a time for the highest-quality response and faster triage of the relevant symptoms.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Chatbot;