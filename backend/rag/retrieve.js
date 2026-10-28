const { embedText } = require('./embed');
const { loadChunks } = require('./store');

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
    .filter((match) => match.score >= threshold)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, Math.min(Number(topK) || 4, 10)));

  return matches;
};

module.exports = { searchKnowledgeBase, cosineSimilarity };
