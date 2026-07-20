const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const buildFallbackReply = (message) => {
  const normalizedMessage = String(message || '').toLowerCase();

  if (normalizedMessage.includes('cramp') || normalizedMessage.includes('pain')) {
    return 'For cramp relief, try hydration, gentle heat, and light stretching. If pain is severe, worsening, or affecting daily life, please consult a doctor.';
  }

  if (normalizedMessage.includes('irregular') || normalizedMessage.includes('late') || normalizedMessage.includes('missed')) {
    return 'Cycle variation can happen due to stress, sleep, diet, or hormonal changes. Keep tracking your dates for 2-3 cycles and consult a doctor if irregularity continues.';
  }

  if (normalizedMessage.includes('fertile') || normalizedMessage.includes('ovulation')) {
    return 'Your fertile window is usually around ovulation, often about 14 days before the next period. Use cycle logs over multiple months for better accuracy.';
  }

  return 'I am temporarily running in offline guidance mode. Keep tracking your cycle, symptoms, sleep, and hydration daily, and please consult a doctor for medical advice or persistent concerns.';
};

const chat = async (req, res) => {
  const { message } = req.body;
  const user_id = req.user.id;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!genAI) {
    return res.status(200).json({
      message: 'AI service is not configured',
      reply: buildFallbackReply(message),
      degraded: true,
    });
  }

  try {
    const query = db.promise().query.bind(db.promise());

    const [cycleRows] = await query(
      'SELECT * FROM cycles WHERE user_id = ? ORDER BY start_date DESC LIMIT 3',
      [user_id],
    );

    const [symptomRows] = await query(
      'SELECT * FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 5',
      [user_id]
    );

    const cycleContext = cycleRows.length > 0
      ? `User's recent cycles: ${JSON.stringify(cycleRows)}`
      : 'No cycle data available yet';

    const symptomContext = symptomRows.length > 0
      ? `User's recent symptoms: ${JSON.stringify(symptomRows)}`
      : 'No symptom data available yet';

    const prompt = `You are a helpful and empathetic menstrual health assistant.
Answer the user's question in a friendly and supportive way.
Keep responses concise and easy to understand.

${cycleContext}
${symptomContext}

User question: ${message}

Provide a helpful personalised response based on their data if relevant.
Always remind them to consult a doctor for medical advice.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error('Gemini error:', error.message);
    if (error.status === 429) {
      return res.status(200).json({ 
        message: 'AI service is busy. Please try again in a minute.',
        reply: buildFallbackReply(message),
        degraded: true,
      });
    }

    res.status(200).json({
      message: 'AI service error',
      reply: buildFallbackReply(message),
      degraded: true,
    });
  }
};

module.exports = { chat };