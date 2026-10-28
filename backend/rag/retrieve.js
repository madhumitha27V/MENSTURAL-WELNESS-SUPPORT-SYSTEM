const { embedText } = require('./embed');
const { loadChunks } = require('./store');

const STOP_WORDS = new Set([
  'a', 'about', 'and', 'are', 'can', 'do', 'during', 'for', 'help', 'how',
  'i', 'is', 'me', 'my', 'of', 'the', 'to', 'what', 'with', 'you',
]);

const normalizeTerm = (term) => term.endsWith('s') && term.length > 4 ? term.slice(0, -1) : term;

const queryTerms = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter((term) => term.length > 2 && !STOP_WORDS.has(term))
  .map(normalizeTerm);

const lexicalRelevance = (query, content) => {
  const terms = new Set(queryTerms(query));
  if (terms.size === 0) return 0;
  const contentTerms = new Set(queryTerms(content));
  return [...terms].filter((term) => contentTerms.has(term)).length / terms.size;
};

const cosineSimilarity = (left, right) => {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return 0;

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
};

const searchKnowledgeBase = async ({ query, topK = 4, threshold = 0.45 }) => {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) throw new Error('A search query is required');

  const queryEmbedding = await embedText(normalizedQuery, 'RETRIEVAL_QUERY');
  const chunks = await loadChunks();
  const matches = chunks
    .map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      url: chunk.source_url,
      chunkId: chunk.chunk_index,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .map((match) => ({
      ...match,
      lexicalScore: lexicalRelevance(normalizedQuery, `${match.title} ${match.content}`),
    }))
    .map((match) => ({
      ...match,
      score: match.score * 0.7 + match.lexicalScore * 0.3,
    }))
    .filter((match) => match.score >= threshold)
    .sort((left, right) => (
      (right.score * 0.7 + right.lexicalScore * 0.3)
      - (left.score * 0.7 + left.lexicalScore * 0.3)
    ))
    .slice(0, Math.max(1, Math.min(Number(topK) || 4, 10)));

  return matches;
};

module.exports = { searchKnowledgeBase, cosineSimilarity };
