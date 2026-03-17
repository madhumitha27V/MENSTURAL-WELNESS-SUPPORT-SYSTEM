const express = require('express');
const router = express.Router();
const { Ollama } = require('ollama');

// Initialize Ollama
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Helper to get database pool
const getDb = (req) => req.app.locals.db;

// Helper to get user ID from token
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded.userId || decoded.id;
  } catch (error) {
    return null;
  }
};

// Knowledge base about EUPHORIA app features
const knowledgeBase = {
  // Cycle Phases Information
  cyclePhases: {
    menstrual: {
      days: '1-5',
      description: 'Your period is here. Focus on replenishing lost nutrients and managing symptoms.',
      nutrients: ['Iron (18 mg/day)', 'Vitamin C (75-90 mg/day)', 'Omega-3 (1.1-1.6 g/day)', 'Magnesium (310-320 mg/day)', 'Zinc (8-11 mg/day)'],
      tips: [
        'Rest when you need to, your body is working hard',
        'Stay hydrated with warm water or herbal teas',
        'Use heat packs for cramps',
        'Gentle walks can help with blood flow',
        'It\'s okay to take it easy these days'
      ]
    },
    follicular: {
      days: '6-13',
      description: 'Energy is rising! Support your body\'s rebuilding with protein and nutrients.',
      nutrients: ['Protein (46-56 g/day)', 'B Vitamins (B6: 1.3 mg, B12: 2.4 mcg/day)', 'Zinc (8-11 mg/day)', 'Vitamin E (15 mg/day)', 'Probiotics (1-10 billion CFU/day)'],
      tips: [
        'Great time to start new projects or workouts',
        'Your energy is naturally high, use it wisely',
        'Perfect for social activities and trying new things',
        'Focus on protein-rich meals'
      ]
    },
    ovulation: {
      days: '14-16',
      description: 'Peak fertility and energy! Support hormone balance and inflammation control.',
      nutrients: ['Calcium (1000-1200 mg/day)', 'Vitamin B6 (1.3-1.5 mg/day)', 'Fiber (25-30 g/day)', 'Vitamin C (75-90 mg/day)', 'Folate (400 mcg/day)'],
      tips: [
        'You might feel extra confident and social',
        'Peak time for physical performance',
        'Great for important meetings or presentations',
        'Listen to your body, stay balanced'
      ]
    },
    luteal: {
      days: '17-28',
      description: 'PMS may start. Focus on mood-stabilizing and anti-inflammatory foods.',
      nutrients: ['Magnesium (310-360 mg/day)', 'Vitamin B6 (1.3-1.9 mg/day)', 'Complex Carbs (130-225 g/day)', 'Calcium (1000-1300 mg/day)', 'Vitamin D (600-800 IU/day)'],
      tips: [
        'Be extra kind to yourself',
        'Dark chocolate is your friend (in moderation)',
        'Gentle exercise helps with mood',
        'Journal your feelings, they\'re valid',
        'Plan cozy self-care activities'
      ]
    }
  },

  // Common symptoms and solutions
  symptoms: {
    cramps: {
      solutions: [
        'Try a heating pad on your lower abdomen',
        'Gentle yoga or stretching can help',
        'Magnesium-rich foods like dark chocolate and nuts',
        'Stay hydrated with warm herbal teas',
        'If pain is severe (8+), consider seeing a doctor'
      ]
    },
    bloating: {
      solutions: [
        'Reduce salt intake',
        'Drink plenty of water (sounds counterintuitive, but it helps!)',
        'Peppermint or ginger tea',
        'Light walks to aid digestion',
        'Avoid carbonated drinks'
      ]
    },
    moodSwings: {
      solutions: [
        'Regular exercise releases endorphins',
        'Dark chocolate (yes, really!)',
        'Talk to someone you trust',
        'Practice meditation or deep breathing',
        'Track your cycle to anticipate mood changes'
      ]
    },
    headache: {
      solutions: [
        'Stay hydrated',
        'Get enough sleep (7-9 hours)',
        'Reduce caffeine intake',
        'Try cold compress on forehead',
        'Magnesium supplements might help'
      ]
    },
    fatigue: {
      solutions: [
        'Prioritize sleep and rest',
        'Iron-rich foods if you\'re on your period',
        'Light exercise for energy boost',
        'Avoid heavy, processed foods',
        'Listen to your body and rest when needed'
      ]
    },
    anxiety: {
      solutions: [
        'Deep breathing exercises',
        'Meditation or mindfulness',
        'Limit caffeine',
        'Talk to a friend or counselor',
        'Gentle exercise like walking or yoga'
      ]
    }
  },

  // App features guidance
  appFeatures: {
    preCycle: 'Track your PMS symptoms before your period starts to get personalized prevention tips',
    activeCycle: 'Log your period symptoms in real-time for location-based and flow-specific suggestions',
    food: 'Get personalized nutrition recommendations based on your cycle day (1-28)',
    calendar: 'View and track your cycle history and predict future periods',
    suggestions: 'Get AI-powered suggestions based on your symptoms and cycle phase'
  }
};

// Pattern matching and intent recognition
function analyzeIntent(message) {
  const msg = message.toLowerCase();

  // Greeting patterns
  if (/(hi|hello|hey|good morning|good evening)/i.test(msg)) {
    return { intent: 'greeting', confidence: 0.9 };
  }

  // Cycle phase queries
  if (/(what|which|tell).*(phase|cycle|stage)/i.test(msg) || /phase|cycle day/i.test(msg)) {
    return { intent: 'cyclePhase', confidence: 0.85 };
  }

  // Food/nutrition queries
  if (/(food|eat|nutrition|nutrient|diet)/i.test(msg)) {
    return { intent: 'nutrition', confidence: 0.85 };
  }

  // Symptom queries
  if (/(cramp|pain|bloat|headache|tired|fatigue|mood|anxiety|sad|irritat)/i.test(msg)) {
    return { intent: 'symptoms', confidence: 0.9 };
  }

  // Help with features
  if (/(how|help|use|track|log|record)/i.test(msg)) {
    return { intent: 'help', confidence: 0.8 };
  }

  // Tips and advice
  if (/(tip|advice|suggest|recommend|what should|help with)/i.test(msg)) {
    return { intent: 'advice', confidence: 0.85 };
  }

  // Emotional support
  if (/(feel|feeling|hurt|bad|awful|terrible|pain)/i.test(msg)) {
    return { intent: 'support', confidence: 0.8 };
  }

  return { intent: 'general', confidence: 0.5 };
}

// Generate contextual responses
function generateResponse(intent, message) {
  const msg = message.toLowerCase();

  switch (intent) {
    case 'greeting':
      const greetings = [
        "Hey! 👋 How are you feeling today?",
        "Hi there! 💙 I'm here to help. What's going on?",
        "Hello! 🌸 Ready to chat about your cycle or just talk? I'm all ears!",
        "Hey friend! How can I support you today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];

    case 'cyclePhase':
      return `To know your current cycle phase, I need to know what day you're on! 

The cycle is divided into:
🩸 **Menstrual Phase (Days 1-5)**: Your period
🌱 **Follicular Phase (Days 6-13)**: Rising energy
🥚 **Ovulation Phase (Days 14-16)**: Peak fertility
🌙 **Luteal Phase (Days 17-28)**: PMS may occur

You can check the Food page and enter your cycle day to get personalized nutrition tips! Want to know more about any specific phase?`;

    case 'nutrition':
      if (/menstrual|period|day 1|day 2|day 3|day 4|day 5/i.test(msg)) {
        return `During your period (Days 1-5), focus on:

🔴 **Iron (18 mg/day)** - Replenish blood loss
🍊 **Vitamin C (75-90 mg/day)** - Helps iron absorption
🐟 **Omega-3 (1.1-1.6 g/day)** - Reduces inflammation
🥜 **Magnesium (310-320 mg/day)** - Relieves cramps
🌰 **Zinc (8-11 mg/day)** - Immune support

Head to the Food page and enter your cycle day for more detailed recommendations!`;
      }
      
      return `Great question! Your nutritional needs change throughout your cycle. 

Head to the **Food page** and enter your cycle day (1-28) to get personalized nutrient requirements and recommendations! 

Each phase needs different nutrients:
- Days 1-5: Focus on iron and anti-inflammatory foods
- Days 6-13: Build with protein and B vitamins
- Days 14-16: Balance hormones with calcium and fiber
- Days 17-28: Stabilize mood with magnesium and complex carbs

Want details about a specific phase?`;

    case 'symptoms':
      // Check for specific symptoms
      if (/cramp/i.test(msg)) {
        return `Ugh, cramps are the worst! Here's what can help:

🔥 **Heat therapy**: Heating pad or hot water bottle on your lower belly
🧘 **Gentle stretching**: Child's pose and cat-cow yoga poses
🍫 **Magnesium foods**: Dark chocolate, nuts, leafy greens
☕ **Herbal tea**: Chamomile or ginger tea
💊 **Pain relief**: If it's really bad (pain level 8+), don't hesitate to take medication or see a doctor

You can also track this in the Active Cycle page for personalized suggestions!`;
      }

      if (/bloat/i.test(msg)) {
        return `Bloating is so uncomfortable! Try these:

💧 **Hydration**: Drink lots of water (helps flush out excess sodium)
🧂 **Reduce salt**: Avoid salty snacks and processed foods
🍵 **Herbal tea**: Peppermint or ginger tea
🚶 **Light movement**: A gentle walk aids digestion
🥤 **Avoid carbonation**: Skip the fizzy drinks

Track your symptoms in the app to spot patterns!`;
      }

      if (/mood|anxiety|sad|depress|irritat/i.test(msg)) {
        return `Your feelings are totally valid! 💙 Hormones can really affect mood.

🏃 **Exercise**: Even a short walk releases endorphins
🍫 **Dark chocolate**: Contains mood-boosting compounds
💭 **Talk it out**: Call a friend or journal your thoughts
🧘 **Mindfulness**: Try meditation or deep breathing
📅 **Track patterns**: Use the Pre-Cycle page to anticipate mood changes

Remember: What you're feeling is real and temporary. Be gentle with yourself! Want to talk about it?`;
      }

      if (/headache|head hurt/i.test(msg)) {
        return `Headaches during your cycle are common! Here's what helps:

💧 **Hydration**: Dehydration is a common culprit
😴 **Sleep**: Aim for 7-9 hours
☕ **Limit caffeine**: Can make hormonal headaches worse
❄️ **Cold compress**: On your forehead
💊 **Magnesium**: Can help prevent menstrual migraines

If headaches are severe or frequent, definitely chat with your doctor!`;
      }

      if (/tired|fatigue|exhaust|energy/i.test(msg)) {
        return `Fatigue during your cycle is totally normal! Your body is doing a lot.

😴 **Rest**: Don't fight it, your body needs recovery time
🥩 **Iron-rich foods**: Especially during your period
🚶 **Light exercise**: Paradoxically, gentle movement can boost energy
🥗 **Balanced meals**: Avoid sugar crashes
☕ **Moderate caffeine**: Don't overdo it

It's okay to slow down. Listen to your body! 💙`;
      }

      return `I'm here to help with any symptoms! Common ones include:

- Cramps 
- Bloating
- Mood swings
- Headaches
- Fatigue
- Anxiety

Tell me what you're experiencing, and I'll give you some tips! Or track your symptoms in the Pre-Cycle or Active Cycle pages for personalized suggestions.`;

    case 'help':
      return `Happy to help! Here's what EUPHORIA can do for you:

📝 **Pre-Cycle Tracking**: Log PMS symptoms before your period for prevention tips
🩸 **Active Cycle**: Track your period in real-time with location-based suggestions
🍽️ **Food Guide**: Enter your cycle day (1-28) for personalized nutrition needs
📅 **Calendar**: View your cycle history and predictions
💡 **Suggestions**: Get personalized advice based on your symptoms

Which feature would you like to know more about?`;

    case 'advice':
      const tips = [
        "Track your cycle consistently - patterns help predict symptoms! 📊",
        "Hydration is key throughout your entire cycle. Aim for 8 glasses a day! 💧",
        "During your luteal phase (Days 17-28), be extra kind to yourself. PMS is real! 💙",
        "Exercise adapts to your cycle: High intensity in follicular phase, gentle in menstrual phase. 🏃",
        "Dark chocolate isn't just a craving - it's rich in magnesium which helps with cramps! 🍫",
        "Quality sleep (7-9 hours) can dramatically improve PMS symptoms. 😴",
        "Keep healthy snacks handy during luteal phase to manage cravings better. 🥜"
      ];
      return tips[Math.floor(Math.random() * tips.length)] + "\n\nWant more specific advice about something?";

    case 'support':
      return `Hey, I hear you. 💙 What you're feeling is valid and real.

Your cycle affects your entire body and mind - it's not "just in your head." Be patient and compassionate with yourself.

Some things that might help:
- Talk to someone you trust
- Do something small that brings you joy
- Remember this phase will pass
- Track your patterns so you can prepare next time

I'm here if you want to talk more or need specific advice. You've got this! 🌸`;

    default:
      return `I'm here for you! I can help with:

- Cycle phase information and what to expect
- Nutrition advice for your cycle day
- Managing symptoms like cramps, bloating, or mood swings
- Using EUPHORIA app features
- General cycle tracking tips and support

What's on your mind? 💙`;
  }
}

// Build context from knowledge base
async function buildContext(message, conversationHistory = [], userId = null, db = null) {
  const msg = message.toLowerCase();
  let context = `You are EUPHORIA Friend, a warm, supportive companion for menstrual cycle tracking. You talk like a caring friend, not a formal assistant. Use emojis naturally.

IMPORTANT CONTEXT RULES:
- When user says "in my cycle", "on my period", "menstruating" = They are in MENSTRUAL PHASE (Days 1-5)
- Pay attention to symptoms mentioned: cramps + bleeding = definitely menstrual phase
- If you previously gave wrong phase info and user corrects you, acknowledge and correct yourself
- Read the conversation history carefully before responding
- Don't make assumptions about cycle day without explicit information
`;

  // Fetch and add user's personal data
  if (userId && db) {
    try {
      // Get user's name
      const [userRows] = await db.execute(
        'SELECT name FROM users WHERE id = ?',
        [userId]
      );
      
      if (userRows.length > 0) {
        const userName = userRows[0].name;
        context += `\nUser's name: ${userName} (use their name occasionally to make it personal)\n`;
      }

      // Get user's cycle data
      const [cycleRows] = await db.execute(
        'SELECT period_start_date, cycle_length, period_end_date FROM cycle_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      
      if (cycleRows.length > 0) {
        const cycleData = cycleRows[0];
        const lastPeriod = new Date(cycleData.period_start_date);
        const today = new Date();
        const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
        const cycleDay = (daysSinceLastPeriod % cycleData.cycle_length) + 1;
        
        let currentPhase = 'unknown';
        if (cycleDay >= 1 && cycleDay <= 5) currentPhase = 'Menstrual (Period)';
        else if (cycleDay >= 6 && cycleDay <= 13) currentPhase = 'Follicular';
        else if (cycleDay >= 14 && cycleDay <= 16) currentPhase = 'Ovulation';
        else if (cycleDay >= 17) currentPhase = 'Luteal (PMS)';
        
        const daysUntilNextPeriod = cycleData.cycle_length - cycleDay;
        
        context += `\nUser's Cycle Information:
- Current cycle day: Day ${cycleDay} of ${cycleData.cycle_length}
- Current phase: ${currentPhase}
- Last period started: ${lastPeriod.toLocaleDateString()}
- Days until next period: approximately ${daysUntilNextPeriod} days
- Use this information to give specific, personalized advice!\n`;
      }

      // Get recent pre-cycle symptoms (last 7 days before period)
      const [preCycleRows] = await db.execute(
        `SELECT physical_symptoms, emotional_symptoms, pain_level, notes, tracking_date 
         FROM pre_cycle_symptoms 
         WHERE user_id = ? 
         ORDER BY tracking_date DESC 
         LIMIT 3`,
        [userId]
      );
      
      if (preCycleRows.length > 0) {
        const recentSymptoms = preCycleRows[0];
        const physicalSymptoms = JSON.parse(recentSymptoms.physical_symptoms || '[]');
        const emotionalSymptoms = JSON.parse(recentSymptoms.emotional_symptoms || '[]');
        
        if (physicalSymptoms.length > 0 || emotionalSymptoms.length > 0) {
          context += `\nUser's Recent Pre-Cycle (PMS) Symptoms:\n`;
          if (physicalSymptoms.length > 0) {
            context += `- Physical: ${physicalSymptoms.join(', ')}\n`;
          }
          if (emotionalSymptoms.length > 0) {
            context += `- Emotional: ${emotionalSymptoms.join(', ')}\n`;
          }
          if (recentSymptoms.pain_level > 0) {
            context += `- Pain level: ${recentSymptoms.pain_level}/10\n`;
          }
          if (recentSymptoms.notes) {
            context += `- Notes: "${recentSymptoms.notes}"\n`;
          }
          context += `(Use this to understand their typical PMS patterns and provide preventive advice)\n`;
        }
      }

      // Get today's or most recent active cycle tracking
      const [activeCycleRows] = await db.execute(
        `SELECT flow_level, pain_level, mood, symptoms, location, water_intake, sleep_hours, notes, tracking_date 
         FROM active_cycle_tracking 
         WHERE user_id = ? 
         ORDER BY tracking_date DESC 
         LIMIT 1`,
        [userId]
      );
      
      if (activeCycleRows.length > 0) {
        const todayTracking = activeCycleRows[0];
        const symptoms = JSON.parse(todayTracking.symptoms || '[]');
        const trackingDate = new Date(todayTracking.tracking_date).toLocaleDateString();
        
        context += `\nUser's Most Recent Period Tracking (${trackingDate}):\n`;
        if (todayTracking.flow_level) {
          context += `- Flow: ${todayTracking.flow_level}\n`;
        }
        if (todayTracking.pain_level > 0) {
          context += `- Pain level: ${todayTracking.pain_level}/10\n`;
        }
        if (todayTracking.mood) {
          context += `- Mood: ${todayTracking.mood}\n`;
        }
        if (symptoms.length > 0) {
          context += `- Symptoms: ${symptoms.join(', ')}\n`;
        }
        if (todayTracking.location) {
          context += `- Location: ${todayTracking.location}\n`;
        }
        if (todayTracking.water_intake > 0) {
          context += `- Water intake: ${todayTracking.water_intake} glasses\n`;
        }
        if (todayTracking.sleep_hours > 0) {
          context += `- Sleep: ${todayTracking.sleep_hours} hours\n`;
        }
        if (todayTracking.notes) {
          context += `- Notes: "${todayTracking.notes}"\n`;
        }
        context += `(Use this to give very specific advice based on their current situation)\n`;
      }

    } catch (error) {
      console.log('Could not fetch user data for context:', error.message);
    }
  }

  context += `\nEUPHORIA App Features:
- Active Cycle: Track period in real-time with location-based suggestions  
- Food Guide: Personalized nutrition for cycle days 1-28
- Calendar: View cycle history and predictions
- Suggestions: Get advice based on symptoms

`;

  // Add relevant cycle phase info
  if (/phase|cycle|day/i.test(msg)) {
    context += `\nCycle Phases:
🩸 Menstrual (Days 1-5): Period - Iron 18mg/day, Vitamin C 75-90mg/day, Omega-3 1.1-1.6g/day, Magnesium 310-320mg/day
🌱 Follicular (Days 6-13): Rising energy - Protein 46-56g/day, B6 1.3mg, B12 2.4mcg/day, Vitamin E 15mg/day
🥚 Ovulation (Days 14-16): Peak fertility - Calcium 1000-1200mg/day, B6 1.3-1.5mg/day, Fiber 25-30g/day
🌙 Luteal (Days 17-28): PMS phase - Magnesium 310-360mg/day, B6 1.3-1.9mg/day, Complex Carbs 130-225g/day
`;
  }

  // Add symptom relief info
  if (/cramp|pain|bloat|headache|mood|anxiety|tired|fatigue/i.test(msg)) {
    context += `\nCommon Symptom Relief:
- Cramps: Heat pad, gentle yoga, magnesium foods (dark chocolate, nuts), warm tea
- Bloating: Hydrate, reduce salt, peppermint tea, light walks
- Mood/Anxiety: Exercise, dark chocolate, meditation, talk to someone
- Headaches: Hydrate, sleep 7-9hrs, limit caffeine, cold compress
- Fatigue: Rest, iron-rich foods, light exercise, balanced meals
`;
  }

  context += `\nRemember: Be supportive, validate feelings, keep responses conversational and friendly. Use the user's tone - if casual, be casual back!`;
  
  return context;
}

// Get chat history endpoint
router.get('/history', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDb(req);
    const [history] = await db.execute(
      `SELECT id, message, response, model, created_at 
       FROM chat_history 
       WHERE user_id = ? 
       ORDER BY created_at ASC 
       LIMIT 100`,
      [userId]
    );

    res.json({ history });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Chat endpoint with LLaMA-3
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received chat message:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try LLaMA-3 first with timeout, fallback to pattern matching
    try {
      // Get recent conversation history for context
      const userId = getUserIdFromToken(req);
      const db = getDb(req);
      let conversationHistory = [];
      
      if (userId && db) {
        try {
          const [recentHistory] = await db.execute(
            `SELECT message, response FROM chat_history 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 5`,
            [userId]
          );
          conversationHistory = recentHistory.reverse(); // Oldest to newest
        } catch (dbError) {
          console.log('Could not fetch conversation history:', dbError.message);
        }
      }

      const context = await buildContext(message, conversationHistory, userId, db);
      console.log('Attempting LLaMA-3 response...');
      
      // Build messages array with conversation history
      const messages = [{ role: 'system', content: context }];
      
      // Add recent conversation context
      conversationHistory.forEach(item => {
        messages.push({ role: 'user', content: item.message });
        messages.push({ role: 'assistant', content: item.response });
      });
      
      // Add current message
      messages.push({ role: 'user', content: message });
      
      // Set timeout for LLaMA response (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLaMA timeout')), 30000)
      );
      
      const ollamaPromise = ollama.chat({
        model: 'llama3',
        messages: messages,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 300
        }
      });

      const ollamaResponse = await Promise.race([ollamaPromise, timeoutPromise]);
      const response = ollamaResponse.message.content;

      console.log('LLaMA-3 response generated successfully');
      
      // Save to database if user is authenticated
      if (userId) {
        try {
          const db = getDb(req);
          await db.execute(
            'INSERT INTO chat_history (user_id, message, response, model) VALUES (?, ?, ?, ?)',
            [userId, message, response, 'llama3']
          );
        } catch (dbError) {
          console.error('Failed to save chat history:', dbError.message);
        }
      }
      
      res.json({ 
        response,
        model: 'llama3',
        timestamp: new Date()
      });

    } catch (ollamaError) {
      console.log('LLaMA-3 not available, using fallback:', ollamaError.message);
      
      // Fallback to pattern matching with personalized data
      const userId = getUserIdFromToken(req);
      const db = getDb(req);
      
      // Fetch user's personalized data for fallback response
      let personalizedResponse = null;
      if (userId && db) {
        try {
          // Get user's name
          const [userRows] = await db.execute(
            'SELECT name FROM users WHERE id = ?',
            [userId]
          );
          
          const userName = userRows.length > 0 ? userRows[0].name : null;
          
          // Get user's cycle data
          const [cycleRows] = await db.execute(
            'SELECT period_start_date, cycle_length, period_end_date FROM cycle_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
          );
          
          if (cycleRows.length > 0) {
            const cycleData = cycleRows[0];
            const lastPeriod = new Date(cycleData.period_start_date);
            const today = new Date();
            const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
            const cycleDay = (daysSinceLastPeriod % cycleData.cycle_length) + 1;
            const daysUntilNextPeriod = cycleData.cycle_length - cycleDay;
            
            const nextPeriodDate = new Date(lastPeriod);
            nextPeriodDate.setDate(lastPeriod.getDate() + cycleData.cycle_length);
            
            let currentPhase = 'unknown';
            let phaseEmoji = '🌸';
            if (cycleDay >= 1 && cycleDay <= 5) {
              currentPhase = 'Menstrual (your period)';
              phaseEmoji = '🩸';
            } else if (cycleDay >= 6 && cycleDay <= 13) {
              currentPhase = 'Follicular';
              phaseEmoji = '🌱';
            } else if (cycleDay >= 14 && cycleDay <= 16) {
              currentPhase = 'Ovulation';
              phaseEmoji = '🥚';
            } else if (cycleDay >= 17) {
              currentPhase = 'Luteal (PMS phase)';
              phaseEmoji = '🌙';
            }
            
            // Check if question is about next period
            if (/when.*next.*period|next.*period/i.test(message)) {
              const greeting = userName ? `Hey ${userName}! ` : 'Hey! ';
              personalizedResponse = `${greeting}Your next period is expected on **${nextPeriodDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}** - that's in approximately **${daysUntilNextPeriod} days**! ${daysUntilNextPeriod <= 3 ? '⏰ Coming very soon!' : ''}\n\nYou're currently on Day ${cycleDay} of your cycle (${currentPhase} phase ${phaseEmoji}).\n\nWant tips for preparing for your period? 💙`;
            }
            // Check if question is about current phase
            else if (/what.*phase|which.*phase|where.*cycle|cycle.*day/i.test(message)) {
              const greeting = userName ? `Hey ${userName}! ` : 'Hey! ';
              personalizedResponse = `${greeting}You're currently in your **${currentPhase}** phase ${phaseEmoji}! You're on **Day ${cycleDay}** of your ${cycleData.cycle_length}-day cycle.\n\nYour next period starts in about **${daysUntilNextPeriod} days** (around ${nextPeriodDate.toLocaleDateString()}).\n\nNeed advice for this phase? Just ask! 💙`;
            }
            // Check if question is about what to eat
            else if (/what.*eat|food|nutrition|nutrient/i.test(message)) {
              const greeting = userName ? `Hey ${userName}! ` : 'Hey! ';
              let nutrients = '';
              if (cycleDay >= 1 && cycleDay <= 5) {
                nutrients = '🔴 **Iron** (18mg/day) - spinach, red meat, lentils\n🍊 **Vitamin C** (75-90mg/day) - oranges, bell peppers\n🐟 **Omega-3** (1.1-1.6g/day) - salmon, walnuts\n🥜 **Magnesium** (310-320mg/day) - dark chocolate, almonds';
              } else if (cycleDay >= 6 && cycleDay <= 13) {
                nutrients = '🥩 **Protein** (46-56g/day) - chicken, eggs, beans\n💊 **B Vitamins** - whole grains, leafy greens\n🌰 **Zinc** (8-11mg/day) - pumpkin seeds, chickpeas\n🥑 **Vitamin E** (15mg/day) - avocado, sunflower seeds';
              } else if (cycleDay >= 14 && cycleDay <= 16) {
                nutrients = '🥛 **Calcium** (1000-1200mg/day) - dairy, fortified plant milk\n🥦 **Fiber** (25-30g/day) - vegetables, whole grains\n🍋 **Vitamin C** (75-90mg/day) - citrus fruits\n🥬 **Folate** (400mcg/day) - leafy greens, beans';
              } else {
                nutrients = '🥜 **Magnesium** (310-360mg/day) - nuts, dark chocolate\n🍠 **Complex Carbs** (130-225g/day) - sweet potato, oats\n🥛 **Calcium** (1000-1300mg/day) - dairy, tofu\n☀️ **Vitamin D** (600-800 IU/day) - egg yolks, fortified foods';
              }
              personalizedResponse = `${greeting}Since you're on Day ${cycleDay} (${currentPhase} phase ${phaseEmoji}), here's what your body needs right now:\n\n${nutrients}\n\nCheck the Food page for more detailed recommendations! 🍽️💙`;
            }
            // Check if asking about symptoms or how they're feeling
            else if (/how.*feel|symptom|feeling|doing|am i/i.test(message)) {
              const greeting = userName ? `Hey ${userName}! ` : 'Hey! ';
              
              // Get their recent active cycle tracking to see current symptoms
              const [activeTracking] = await db.execute(
                `SELECT symptoms, pain_level, mood, notes FROM active_cycle_tracking 
                 WHERE user_id = ? ORDER BY tracking_date DESC LIMIT 1`,
                [userId]
              );
              
              if (activeTracking.length > 0) {
                const symptoms = JSON.parse(activeTracking[0].symptoms || '[]');
                const mood = activeTracking[0].mood;
                const painLevel = activeTracking[0].pain_level;
                
                let response = `${greeting}Based on what you've tracked recently:\n\n`;
                response += `You're on Day ${cycleDay} (${currentPhase} ${phaseEmoji})\n`;
                
                if (symptoms.length > 0) {
                  response += `\n**Symptoms you reported:** ${symptoms.join(', ')}\n`;
                  
                  // Give specific advice based on symptoms
                  if (symptoms.includes('Cramps')) {
                    response += `\n🌡️ For cramps: Try heat therapy and gentle stretching`;
                  }
                  if (symptoms.includes('Headache')) {
                    response += `\n💤 For headaches: Rest in a dark room and stay hydrated`;
                  }
                  if (symptoms.includes('Bloating')) {
                    response += `\n💧 For bloating: Drink water and avoid salty foods`;
                  }
                }
                
                if (painLevel > 0) {
                  response += `\n\n**Pain level:** ${painLevel}/10`;
                  if (painLevel >= 7) {
                    response += ` - That's quite high! Make sure to rest and take pain relief if needed.`;
                  }
                }
                
                if (mood) {
                  response += `\n**Mood:** ${mood}`;
                }
                
                response += `\n\nHow can I help you feel better? 💙`;
                personalizedResponse = response;
              } else {
                personalizedResponse = `${greeting}You're on Day ${cycleDay} of your cycle (${currentPhase} phase ${phaseEmoji}).\n\nHow are you feeling today? Track your symptoms on the Active Cycle page so I can give you better personalized advice! 💙`;
              }
            }
          }
        } catch (error) {
          console.log('Error fetching personalized data:', error.message);
        }
      }
      
      // Use personalized response if available, otherwise use generic
      const response = personalizedResponse || generateResponse(analyzeIntent(message).intent, message);

      // Save to database if user is authenticated
      if (userId) {
        try {
          await db.execute(
            'INSERT INTO chat_history (user_id, message, response, model) VALUES (?, ?, ?, ?)',
            [userId, message, response, 'fallback']
          );
        } catch (dbError) {
          console.error('Failed to save chat history:', dbError.message);
        }
      }

      res.json({ 
        response,
        model: 'fallback',
        timestamp: new Date()
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      response: "I'm having a bit of trouble right now, but I'm still here! Try asking me something else. 💙",
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
