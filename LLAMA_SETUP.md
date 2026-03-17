# LLaMA-3 Integration Setup for EUPHORIA Chatbot

## Prerequisites
Your backend is now ready to use LLaMA-3! Follow these steps to enable it:

## Step 1: Install Ollama

### For Windows:
1. Download Ollama from: https://ollama.ai/download
2. Run the installer
3. Ollama will start automatically as a service

### Verify Installation:
Open a new terminal and run:
```bash
ollama --version
```

## Step 2: Download LLaMA-3 Model

In a terminal, run:
```bash
ollama pull llama3
```

This will download the LLaMA-3 model (~4.7GB). It may take a few minutes depending on your internet speed.

## Step 3: Test LLaMA-3

Test if it's working:
```bash
ollama run llama3
```

You should see a chat interface. Type something and press Enter. If you get a response, it's working!
Type `/bye` to exit.

## Step 4: Restart Your Backend

The backend is already configured to use LLaMA-3. Just restart it:

1. Stop the current backend server (Ctrl+C in the terminal)
2. Restart it:
```bash
cd backend
node server.js
```

## How It Works

### Smart Fallback System:
- **If Ollama is running**: Chatbot uses LLaMA-3 for intelligent, contextual responses
- **If Ollama is not running**: Chatbot automatically falls back to pattern matching

### What LLaMA-3 Brings:
✅ Natural conversational responses
✅ Better context understanding
✅ Handles complex questions
✅ More empathetic and human-like
✅ Learns from conversation context
✅ Completely private (runs locally)
✅ No API costs

### Knowledge Injection:
The chatbot injects EUPHORIA-specific knowledge into every LLaMA-3 conversation:
- All cycle phases and nutrient requirements
- Symptom management tips
- App feature guidance
- Supportive, friend-like tone

## Testing

1. Start Ollama (should auto-start on Windows)
2. Verify it's running: `http://localhost:11434` in browser (should show "Ollama is running")
3. Start backend: `node server.js`
4. Start frontend: `npm start`
5. Open the chatbot and ask anything!

## Example Questions to Try:

- "I'm on day 3 of my cycle and feeling really tired"
- "What foods should I eat during ovulation?"
- "I have bad cramps, what can help?"
- "Feeling really anxious before my period"
- "How does the Food page work?"

## Troubleshooting

**If chatbot falls back to pattern matching:**
1. Check if Ollama is running: `ollama list`
2. Ensure LLaMA-3 is downloaded: `ollama list` (should show llama3)
3. Test Ollama: `ollama run llama3`
4. Check backend logs for errors

**If responses are slow:**
- First response is always slower (~2-5 seconds)
- Subsequent responses are faster
- Consider using a smaller model: `ollama pull llama3:8b` (smaller, faster)

**System Requirements:**
- Minimum: 8GB RAM
- Recommended: 16GB RAM
- Disk Space: ~5GB for model

## Model Options

You can use different LLaMA variants:

```bash
# Default (best quality, ~4.7GB)
ollama pull llama3

# Smaller, faster (~4GB)
ollama pull llama3:8b

# Even smaller (~2GB)
ollama pull llama3.2:1b
```

Change the model in `backend/routes/chat.js`:
```javascript
model: 'llama3:8b'  // or 'llama3.2:1b'
```

## Benefits of This Setup

🔒 **Privacy**: All data stays on your machine
💰 **Free**: No API costs ever
⚡ **Fast**: After first load, responses are quick
🧠 **Smart**: Much better than pattern matching
🎯 **Contextual**: Understands EUPHORIA features
💙 **Empathetic**: Responds like a caring friend

Enjoy your AI-powered EUPHORIA companion! 🌸
