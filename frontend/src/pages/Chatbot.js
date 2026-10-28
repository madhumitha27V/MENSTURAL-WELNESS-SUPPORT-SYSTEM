import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UiContext';
import api, { getApiErrorMessage, getAuthConfig } from '../lib/api';
import VideoPlayer from '../components/VideoPlayer';

// Offline fallback responses when Gemini API is unavailable
const offlineResponses = {
  cramp: 'For period cramps, try a heating pad on your lower abdomen, gentle stretching or yoga, staying hydrated, and magnesium-rich foods like dark chocolate and bananas. Ibuprofen can help with inflammation. Always consult a doctor if pain is severe.',
  pain: 'Pain during periods is common but should not be debilitating. Track your pain levels 1-10 over a few cycles. If pain consistently exceeds 7 or interferes with daily life, please consult a gynaecologist as it may indicate conditions like endometriosis.',
  fertile: 'Your fertile window is typically 5 days before ovulation and the day of ovulation itself. Ovulation usually occurs around day 14 of a 28-day cycle. Track basal body temperature and cervical mucus changes for more accuracy.',
  irregular: 'Irregular cycles can be caused by stress, significant weight changes, thyroid disorders, PCOS, or hormonal imbalances. If your cycle varies by more than 7-9 days consistently, consider consulting a doctor.',
  food: 'During periods, focus on iron-rich foods like spinach and lentils, anti-inflammatory foods like ginger and turmeric, and hydrating fruits. Reduce salt to minimise bloating and limit caffeine which can worsen cramps.',
  mood: 'Mood swings before periods are caused by fluctuating progesterone and estrogen. Regular exercise, consistent sleep, reducing sugar and caffeine, and mindfulness practices can help. Evening primrose oil and vitamin B6 are also commonly recommended.',
  sleep: 'Poor sleep during your cycle is very common, especially in the luteal phase. Keep your bedroom cool, avoid screens 1 hour before bed, try magnesium glycinate supplements, and maintain a consistent sleep schedule.',
  bloat: 'Bloating is caused by hormonal changes that affect fluid retention. Reduce sodium intake, avoid carbonated drinks, eat smaller meals more frequently, and try peppermint tea. Light walking can also help move gas through the digestive system.',
  default: 'I am currently in offline mode due to API limitations. For personalised wellness guidance, please try again later when the AI service is available. In the meantime, I recommend tracking your symptoms daily and consulting a healthcare provider for specific medical concerns.',
};

const getOfflineResponse = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes('cramp') || lower.includes('pain')) return offlineResponses.cramp;
  if (lower.includes('fertile') || lower.includes('ovulat') || lower.includes('pregnant')) return offlineResponses.fertile;
  if (lower.includes('irregular') || lower.includes('cycle') || lower.includes('period')) return offlineResponses.irregular;
  if (lower.includes('food') || lower.includes('eat') || lower.includes('diet') || lower.includes('nutrition')) return offlineResponses.food;
  if (lower.includes('mood') || lower.includes('emotion') || lower.includes('anxiety') || lower.includes('pms')) return offlineResponses.mood;
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired')) return offlineResponses.sleep;
  if (lower.includes('bloat') || lower.includes('water') || lower.includes('retain')) return offlineResponses.bloat;
  return offlineResponses.default;
};

const STORAGE_KEY = 'wellness_chat_history';

const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const Chatbot = () => {
  const { token } = useAuth();
  const { notify } = useUI();

  const savedMessages = useMemo(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const [messages, setMessages] = useState(savedMessages || [
    {
      role: 'bot',
      text: 'Hi! I am your personal wellness assistant 🌸 Ask me anything about your health and menstrual cycle!',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptFilter, setPromptFilter] = useState('all');
  const [isOffline, setIsOffline] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Save chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // Typing animation
  const animateTyping = useCallback((text, onComplete) => {
    setIsTyping(true);
    setTypingText('');
    let index = 0;
    const speed = Math.max(8, Math.min(20, 2000 / text.length));

    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTypingText('');
        onComplete(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const userEntry = { role: 'user', text: userMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userEntry]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMessage }, getAuthConfig(token));
      const data = res.data;
      setIsOffline(false);
      setLoading(false);

      if (data.type === 'youtube' && data.videoId) {
        const youtubeMessage = {
          role: 'bot',
          type: 'youtube',
          text: data.message || `Playing ${data.title}`,
          title: data.title,
          videoId: data.videoId,
          thumbnail: data.thumbnail,
          channel: data.channel,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, youtubeMessage]);
        return;
      }

      const replyText = data.reply || data.message || 'I am sorry, I could not process that right now.';
      animateTyping(replyText, (fullText) => {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: fullText,
          citations: data.citations || [],
          safetyAlert: data.safetyAlert,
          requiresMedicalCare: data.requiresMedicalCare,
          timestamp: new Date().toISOString(),
        }]);
      });
    } catch (err) {
      setLoading(false);
      console.error('Chat request failed:', err);
      const errorMessage = getApiErrorMessage(err, 'AI service unavailable. Using offline guidance mode.');
      setIsOffline(true);
      notify(errorMessage, 'warning');
      const offlineReply = getOfflineResponse(userMessage);
      animateTyping(offlineReply, (fullText) => {
        setMessages(prev => [...prev, { role: 'bot', text: fullText, timestamp: new Date().toISOString(), offline: true }]);
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const clearHistory = () => {
    const initial = [{
      role: 'bot',
      text: 'Chat history cleared. Hi again! I am your personal wellness assistant 🌸 Ask me anything!',
      timestamp: new Date().toISOString(),
    }];
    setMessages(initial);
    localStorage.removeItem(STORAGE_KEY);
    notify('Chat history cleared.', 'success');
  };

  const quickQuestions = useMemo(() => ([
    { label: 'Period relief', category: 'comfort', text: 'What can help with period cramps?', emoji: '🌡️' },
    { label: 'Fertility', category: 'planning', text: 'How do I track my fertile window?', emoji: '🌱' },
    { label: 'Cycle regularity', category: 'analysis', text: 'Why is my cycle irregular?', emoji: '📊' },
    { label: 'Nutrition', category: 'comfort', text: 'What foods help during periods?', emoji: '🥗' },
    { label: 'Mood support', category: 'wellbeing', text: 'How can I manage mood swings before my period?', emoji: '💜' },
    { label: 'Red flags', category: 'analysis', text: 'What symptoms mean I should seek medical advice?', emoji: '⚠️' },
    { label: 'Sleep tips', category: 'wellbeing', text: 'How do I sleep better during my cycle?', emoji: '😴' },
    { label: 'Exercise guide', category: 'comfort', text: 'What exercises are best during my period?', emoji: '🏃' },
  ]), []);

  const visibleQuestions = quickQuestions.filter(
    (question) => promptFilter === 'all' || question.category === promptFilter
  );

  return (
    <div className="page chat-layout">
      <section className="chat-card">
        <div className="section-card__header">
          <div>
            <div className="eyebrow">AI assistant</div>
            <h1 className="hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Conversational wellness guidance
            </h1>
            <p className="hero-subtitle">
              A calm focused interface for asking health questions with typing animation, offline fallback, and chat history.
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 600,
            color: isOffline ? '#f59e0b' : '#22c55e',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isOffline ? '#f59e0b' : '#22c55e',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            {isOffline ? 'Offline mode — using local guidance' : 'AI assistant online'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{messages.length - 1} messages in this session</span>
          <button
            type="button"
            className="pill pill--ghost"
            onClick={clearHistory}
            style={{ marginLeft: 'auto', fontSize: '11px' }}
          >
            Clear history
          </button>
        </div>

        {/* Quick chips */}
        <div className="chips" style={{ marginBottom: '16px' }}>
          {quickQuestions.slice(0, 3).map((question) => (
            <button
              key={question.label}
              type="button"
              className="pill"
              onClick={() => { setInput(question.text); inputRef.current?.focus(); }}
            >
              {question.emoji} {question.label}
            </button>
          ))}
        </div>

        {/* Chat stream */}
        <div className="chat-stream" role="log" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-message chat-message--${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className={`chat-bubble chat-bubble--${message.role === 'user' ? 'user' : 'assistant'}`}>
                {message.type === 'youtube' ? (
                  <div className="chat-youtube-block">
                    <p style={{ marginBottom: '10px', fontWeight: 600 }}>{message.text}</p>
                    <div className="chat-youtube-meta">
                      <strong>{message.title}</strong>
                      <span>{message.channel}</span>
                    </div>
                    <VideoPlayer videoId={message.videoId} thumbnail={message.thumbnail} title={message.title} />
                  </div>
                ) : (
                  <>
                    {message.text}
                    {message.requiresMedicalCare && message.safetyAlert && (
                      <div
                        role="alert"
                        style={{
                          marginTop: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          color: '#991b1b',
                          background: '#fef2f2',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {message.safetyAlert}
                      </div>
                    )}
                    {message.offline && (
                      <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '6px', fontWeight: 600 }}>
                        ⚡ Offline guidance mode
                      </div>
                    )}
                  </>
                )}
              </div>
              {message.role === 'bot' && message.citations?.length > 0 && (
                <div
                  aria-label="Sources"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', paddingLeft: '4px' }}
                >
                  {message.citations.map((citation) => (
                    <a
                      key={`${citation.url}-${citation.chunkId}`}
                      className="pill"
                      href={citation.url}
                      target="_blank"
                      rel="noreferrer"
                      title={`Similarity ${citation.score ?? 'n/a'}`}
                    >
                      {citation.title}
                    </a>
                  ))}
                </div>
              )}

              {/* Timestamp + Copy */}
              <div style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px',
                paddingLeft: message.role === 'user' ? 0 : '4px',
                paddingRight: message.role === 'user' ? '4px' : 0,
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {message.timestamp ? formatTime(message.timestamp) : ''}
                </span>
                {message.role === 'bot' && (
                  <button
                    type="button"
                    onClick={() => copyMessage(message.text, index)}
                    style={{
                      fontSize: '10px',
                      color: copiedIndex === index ? '#22c55e' : 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      transition: 'color 0.2s',
                    }}
                    aria-label="Copy message"
                  >
                    {copiedIndex === index ? '✓ Copied' : '⎘ Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing animation */}
          {(loading || isTyping) && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-bubble chat-bubble--assistant">
                {isTyping ? (
                  <span>{typingText}<span style={{ animation: 'blink 1s infinite', opacity: 1 }}>|</span></span>
                ) : (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: '7px', height: '7px', borderRadius: '50%',
                          background: '#5b6cff',
                          display: 'inline-block',
                          animation: `bounce 1.2s ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-inputRow">
          <textarea
            ref={inputRef}
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about cramps, cycle timing, fertility, nutrition, or symptoms..."
            aria-label="Chat message input"
            disabled={isTyping}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={sendMessage}
            disabled={loading || !input.trim() || isTyping}
          >
            {loading ? 'Thinking...' : isTyping ? 'Typing...' : 'Send message'}
          </button>
        </div>

        {/* Keyboard hint */}
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
          Press Enter to send · Shift+Enter for new line
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
          Educational information only — not a diagnosis or substitute for medical care.
        </p>
      </section>

      {/* Prompt library sidebar */}
      <aside className="section-card section-card--narrow">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Prompt library</h2>
            <p className="section-card__subtitle">Filter the prompt set to the context you need.</p>
          </div>
        </div>

        <div className="control-bar">
          <select
            className="select"
            value={promptFilter}
            onChange={(event) => setPromptFilter(event.target.value)}
          >
            <option value="all">All topics</option>
            <option value="comfort">Comfort</option>
            <option value="planning">Planning</option>
            <option value="analysis">Analysis</option>
            <option value="wellbeing">Wellbeing</option>
          </select>
        </div>

        <div className="chip-grid">
          {visibleQuestions.map((question) => (
            <button
              key={question.label}
              type="button"
              className="quick-card"
              onClick={() => { setInput(question.text); inputRef.current?.focus(); }}
            >
              <div className="quick-card__icon">{question.emoji}</div>
              <h3 className="quick-card__title">{question.label}</h3>
              <p className="quick-card__copy">{question.text}</p>
            </button>
          ))}
        </div>

        <div className="mini-panel">
          <h3 className="quick-card__title">Conversation guidance</h3>
          <p className="quick-card__copy">
            Ask one focused question at a time for the highest quality response and faster triage of relevant symptoms.
          </p>
        </div>

        {isOffline && (
          <div className="mini-panel" style={{ borderLeft: '3px solid #f59e0b' }}>
            <h3 className="quick-card__title" style={{ color: '#f59e0b' }}>⚡ Offline mode active</h3>
            <p className="quick-card__copy">
              The AI service is temporarily unavailable. Local evidence-based guidance is being used instead. Full AI responses will resume automatically when the service is restored.
            </p>
          </div>
        )}
      </aside>

      {/* CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;