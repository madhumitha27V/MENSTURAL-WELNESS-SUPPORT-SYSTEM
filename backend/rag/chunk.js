const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 80;

const tokenize = (text) => String(text || '').trim().split(/\s+/).filter(Boolean);

const chunkText = (text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) => {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive integer');
  }
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new Error('overlap must be between zero and chunkSize - 1');
  }

  const tokens = tokenize(text);
  const chunks = [];
  const step = chunkSize - overlap;

  for (let start = 0; start < tokens.length; start += step) {
    const content = tokens.slice(start, start + chunkSize).join(' ').trim();
    if (content) chunks.push({ chunkIndex: chunks.length, content });
    if (start + chunkSize >= tokens.length) break;
  }

  return chunks;
};

module.exports = { chunkText, DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP };
