const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001';

const getEmbeddingModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for RAG embeddings');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
  });
};

const embedText = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  const result = await getEmbeddingModel().embedContent({
    content: { role: 'user', parts: [{ text: String(text) }] },
    taskType,
  });
  const values = result?.embedding?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Gemini returned an empty embedding');
  }

  return values;
};

module.exports = { embedText, DEFAULT_EMBEDDING_MODEL };
