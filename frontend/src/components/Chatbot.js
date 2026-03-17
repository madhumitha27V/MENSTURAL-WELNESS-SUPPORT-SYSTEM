import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chatbot.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when chatbot opens
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, historyLoaded]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedHistory = [];
        
        data.history.forEach(item => {
          formattedHistory.push({
            type: 'user',
            text: item.message,
            timestamp: new Date(item.created_at)
          });
          formattedHistory.push({
            type: 'bot',
            text: item.response,
            timestamp: new Date(item.created_at)
          });
        });

        if (formattedHistory.length === 0) {
          // Show welcome message if no history
          formattedHistory.push({
            type: 'bot',
            text: "Hey there! 👋 I'm your EUPHORIA companion. I'm here to help you with anything about your cycle, symptoms, nutrition, or just to chat! What's on your mind?",
            timestamp: new Date()
          });
        }

        setMessages(formattedHistory);
        setHistoryLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Show welcome message on error
      setMessages([{
        type: 'bot',
        text: "Hey there! 👋 I'm your EUPHORIA companion. I'm here to help you with anything about your cycle, symptoms, nutrition, or just to chat! What's on your mind?",
        timestamp: new Date()
      }]);
      setHistoryLoaded(true);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();
      
      setTimeout(() => {
        const botMessage = {
          type: 'bot',
          text: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: "Oops! I'm having trouble connecting right now. But I'm still here for you! Try asking me something else. 💙",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const quickReplies = [
    "What's my cycle phase?",
    "Food recommendations",
    "Help with cramps",
    "Track symptoms",
    "PMS tips"
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-container ${isFullscreen ? 'fullscreen' : ''}`}>
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🌸</div>
              <div>
                <h3>EUPHORIA Friend</h3>
                <p className="chatbot-status">
                  <span className="status-dot"></span>
                  Always here for you
                </p>
              </div>
            </div>
            <div className="chatbot-controls">
              <button 
                className="chatbot-fullscreen"
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label="Toggle fullscreen"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '⊡' : '⛶'}
              </button>
              <button 
                className="chatbot-minimize"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
              >
                ─
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message-wrapper ${message.type}`}
              >
                <div className={`message ${message.type}`}>
                  {message.type === 'bot' && (
                    <span className="message-avatar">🌸</span>
                  )}
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message bot typing">
                  <span className="message-avatar">🌸</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="quick-replies">
              <p className="quick-replies-label">Quick questions:</p>
              <div className="quick-replies-buttons">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="quick-reply-btn"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              className="chat-textarea"
            />
            <button 
              onClick={sendMessage}
              className="chat-send-btn"
              disabled={!inputMessage.trim()}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
