const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const { searchKnowledgeBase } = require('../rag/retrieve');
const { buildRagPrompt, noRelevantContextReply, MEDICAL_DISCLAIMER } = require('../rag/prompts');
const {
  sanitizeMessage,
  detectRedFlags,
  isPromptInjection,
  medicalAlert,
} = require('../services/safetyService');
const { searchYouTubeVideo } = require('../services/youtubeService');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const MUSIC_KEYWORDS = ['play', 'song', 'music', 'listen', 'melody', 'playlist', 'audio'];

const isMusicRequest = (message) => MUSIC_KEYWORDS.some((keyword) => message.toLowerCase().includes(keyword));

const buildFallbackReply = (message) => {
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes('cramp') || normalizedMessage.includes('pain')) {
    return 'For mild cramp relief, try hydration, gentle heat, and light stretching. If pain is severe, worsening, or affecting daily life, please consult a doctor.';
  }
  if (normalizedMessage.includes('irregular') || normalizedMessage.includes('late') || normalizedMessage.includes('missed')) {
    return 'Cycle variation can happen for many reasons. Keep tracking your dates for 2-3 cycles and consult a doctor if irregularity continues.';
  }
  if (normalizedMessage.includes('fertile') || normalizedMessage.includes('ovulation')) {
    return 'Fertile-window estimates vary and are not guaranteed contraception. Use cycle logs over multiple months and consult a healthcare professional for personal guidance.';
  }
  return `I am temporarily running in offline guidance mode. Keep tracking your cycle and symptoms, and consult a doctor for personal medical advice. ${MEDICAL_DISCLAIMER}`;
};

const getUserContext = async (userId) => {
  const query = db.promise().query.bind(db.promise());
  const [cycleRows] = await query(
    `SELECT start_date, end_date, flow_intensity
     FROM cycles WHERE user_id = ? ORDER BY start_date DESC LIMIT 3`,
    [userId],
  );
  const [symptomRows] = await query(
    `SELECT date, mood, pain_level, symptoms, water_intake, sleep_hours
     FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 5`,
    [userId],
  );

  return JSON.stringify({ cycles: cycleRows, symptoms: symptomRows });
};

const saveChatTurn = async (userId, role, message) => {
  try {
    await db.promise().query(
      'INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)',
      [userId, role, message],
    );
  } catch (error) {
    console.error('Unable to save chat history:', error.message);
  }
};

const responsePayload = ({ reply, citations = [], redFlags = [], degraded = false }) => ({
  type: 'text',
  message: reply,
  reply,
  citations: citations.map((citation) => ({
    title: citation.title,
    url: citation.url,
    chunkId: citation.chunkId,
    score: Number(citation.score.toFixed(3)),
  })),
  safetyAlert: medicalAlert(redFlags),
  requiresMedicalCare: redFlags.length > 0,
  degraded,
  disclaimer: MEDICAL_DISCLAIMER,
});

const chat = async (req, res) => {
  const message = sanitizeMessage(req.body?.message);
  const userId = req.user.id;

  if (!message) return res.status(400).json({ message: 'Message is required' });
  if (message.length < 2) return res.status(400).json({ message: 'Message is too short' });

  const redFlags = detectRedFlags(message);
  await saveChatTurn(userId, 'user', message);

  if (isPromptInjection(message)) {
    const reply = `I can help with menstrual wellness education, but I can't follow requests to override my safety instructions or reveal hidden instructions. ${MEDICAL_DISCLAIMER}`;
    await saveChatTurn(userId, 'assistant', reply);
    return res.json(responsePayload({ reply, redFlags }));
  }

  try {
    if (isMusicRequest(message)) {
      const videoResult = await searchYouTubeVideo(message);
      if (videoResult) {
        const reply = `Playing ${videoResult.title} from ${videoResult.channel}.`;
        await saveChatTurn(userId, 'assistant', reply);
        const { type, ...chatMetadata } = responsePayload({ reply, redFlags });
        return res.json({ ...chatMetadata, type: 'youtube', message: reply, reply, ...videoResult });
      }
    }

    const retrieved = await searchKnowledgeBase({ query: message, topK: 4, threshold: 0.45 });
    if (retrieved.length === 0) {
      const reply = noRelevantContextReply;
      await saveChatTurn(userId, 'assistant', reply);
      return res.json(responsePayload({ reply, redFlags }));
    }

    const citations = retrieved.map(({ title, url, chunkId, score }) => ({ title, url, chunkId, score }));
    if (!genAI) {
      const reply = `${buildFallbackReply(message)} ${medicalAlert(redFlags) || ''}`.trim();
      await saveChatTurn(userId, 'assistant', reply);
      return res.json(responsePayload({ reply, citations, redFlags, degraded: true }));
    }

    const userContext = await getUserContext(userId);
    const retrievedContext = retrieved
      .map((item) => `[${item.title}] ${item.content}`)
      .join('\n\n');
    const prompt = buildRagPrompt({ question: message, retrievedContext, userContext });
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    await saveChatTurn(userId, 'assistant', reply);
    return res.json(responsePayload({ reply, citations, redFlags }));
  } catch (error) {
    console.error('RAG chat error:', error.message);
    const reply = `${buildFallbackReply(message)} ${medicalAlert(redFlags) || ''}`.trim();
    await saveChatTurn(userId, 'assistant', reply);
    return res.json(responsePayload({ reply, redFlags, degraded: true }));
  }
};

module.exports = { chat };
