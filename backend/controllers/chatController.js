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
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 12000);
const HEALTH_TERMS = ['period', 'menstrual', 'cycle', 'cramp', 'pain', 'bleeding', 'fertile', 'ovulat', 'pms', 'pcos', 'symptom', 'sleep', 'mood', 'nutrition', 'exercise', 'pregnan', 'doctor', 'health'];
const replyCache = new Map();

const isMusicRequest = (message) => MUSIC_KEYWORDS.some((keyword) => message.toLowerCase().includes(keyword));
const isHealthQuestion = (message) => HEALTH_TERMS.some((term) => message.toLowerCase().includes(term));
const selectRelevantMatches = (matches) => {
  if (!matches.length) return [];
  const bestScore = matches[0].score;
  return matches.filter((match) => match.score >= bestScore - 0.12).slice(0, 2);
};

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

const buildRetrievedFallbackReply = (message, retrieved) => {
  const source = retrieved[0];
  const sentences = source.content.match(/[^.!?]+[.!?]+/g) || [source.content];
  const terms = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2);
  const asksForAction = /\b(help|relief|manage|reduce|improve|treat|ease|what can i do)\b/i.test(message);
  const scoredSentences = sentences.map((sentence, index) => {
    const normalizedSentence = sentence.toLowerCase();
    const matches = terms.filter((term) => normalizedSentence.includes(term)).length;
    return { sentence: sentence.trim(), score: matches, index };
  });
  const relevantSentences = scoredSentences
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, asksForAction ? 1 : 3)
    .map((item) => item.sentence);
  const relevantText = (relevantSentences.length > 0 ? relevantSentences : sentences.slice(0, 2))
    .join(' ')
    .trim();

  return `Based on the vetted source "${source.title}": ${relevantText} This is general educational information, not a diagnosis or treatment. Consult a qualified healthcare professional for personal advice.`;
};

const generateGeminiReply = async (model, prompt) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms`)), GEMINI_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([
      model.generateContent(prompt),
      timeout,
    ]);
    return result.response.text().trim();
  } finally {
    clearTimeout(timeoutId);
  }
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
  let retrieved = [];

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
    if (!isHealthQuestion(message)) {
      const reply = `I can help with menstrual health, cycle tracking, symptoms, and related wellness questions, but I can't answer unrelated topics. ${MEDICAL_DISCLAIMER}`;
      await saveChatTurn(userId, 'assistant', reply);
      return res.json(responsePayload({ reply, redFlags }));
    }

    if (isMusicRequest(message)) {
      const videoResult = await searchYouTubeVideo(message);
      if (videoResult) {
        const reply = `Playing ${videoResult.title} from ${videoResult.channel}.`;
        await saveChatTurn(userId, 'assistant', reply);
        const { type, ...chatMetadata } = responsePayload({ reply, redFlags });
        return res.json({ ...chatMetadata, type: 'youtube', message: reply, reply, ...videoResult });
      }
    }

    retrieved = await searchKnowledgeBase({ query: message, topK: 4, threshold: 0.45 });
    if (retrieved.length === 0) {
      const reply = noRelevantContextReply;
      await saveChatTurn(userId, 'assistant', reply);
      return res.json(responsePayload({ reply, redFlags }));
    }

    const relevantMatches = selectRelevantMatches(retrieved);
    const citations = relevantMatches.map(({ title, url, chunkId, score }) => ({ title, url, chunkId, score }));
    const cacheKey = message.toLowerCase().replace(/\s+/g, ' ').trim();
    const cached = replyCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < 10 * 60 * 1000) {
      await saveChatTurn(userId, 'assistant', cached.reply);
      return res.json(responsePayload({ reply: cached.reply, citations, redFlags, degraded: cached.degraded }));
    }
    if (!genAI) {
      const reply = `${buildRetrievedFallbackReply(message, retrieved)} ${medicalAlert(redFlags) || ''}`.trim();
      replyCache.set(cacheKey, { reply, createdAt: Date.now(), degraded: true });
      await saveChatTurn(userId, 'assistant', reply);
      return res.json(responsePayload({ reply, citations, redFlags, degraded: true }));
    }

    const userContext = await getUserContext(userId);
    const retrievedContext = relevantMatches
      .map((item) => `[${item.title}] ${item.content}`)
      .join('\n\n');
    const prompt = buildRagPrompt({ question: message, retrievedContext, userContext });
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash',
    });
    const reply = await generateGeminiReply(model, prompt);
    replyCache.set(cacheKey, { reply, createdAt: Date.now(), degraded: false });

    await saveChatTurn(userId, 'assistant', reply);
    return res.json(responsePayload({ reply, citations, redFlags }));
  } catch (error) {
    console.error('RAG chat error:', error.message);
    const citations = selectRelevantMatches(retrieved)
      .map(({ title, url, chunkId, score }) => ({ title, url, chunkId, score }));
    const reply = retrieved.length > 0
      ? `${buildRetrievedFallbackReply(message, retrieved)} ${medicalAlert(redFlags) || ''}`.trim()
      : `${buildFallbackReply(message)} ${medicalAlert(redFlags) || ''}`.trim();
    if (retrieved.length > 0) {
      const cacheKey = message.toLowerCase().replace(/\s+/g, ' ').trim();
      replyCache.set(cacheKey, { reply, createdAt: Date.now(), degraded: true });
    }
    await saveChatTurn(userId, 'assistant', reply);
    return res.json(responsePayload({ reply, citations, redFlags, degraded: true }));
  }
};

module.exports = { chat };
