const verifyRagIngestToken = (req, res, next) => {
  const configuredToken = process.env.RAG_INGEST_TOKEN;
  const suppliedToken = req.headers['x-rag-ingest-token'];

  if (!configuredToken) {
    return res.status(503).json({ message: 'RAG ingestion is not configured' });
  }
  if (!suppliedToken || suppliedToken !== configuredToken) {
    return res.status(403).json({ message: 'RAG ingestion is not authorized' });
  }
  return next();
};

module.exports = { verifyRagIngestToken };
