const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { searchKnowledgeBase } = require('../rag/retrieve');
const { ingestKnowledgeBase } = require('../rag/ingest');
const { verifyRagIngestToken } = require('../rag/ragMiddleware');

const router = express.Router();

router.get('/search', verifyToken, async (req, res, next) => {
  try {
    const results = await searchKnowledgeBase({
      query: req.query.q,
      topK: req.query.topK,
      threshold: req.query.threshold,
    });
    return res.json({ results });
  } catch (error) {
    return next(error);
  }
});

router.post('/ingest', verifyRagIngestToken, async (req, res, next) => {
  try {
    return res.json({ documents: await ingestKnowledgeBase() });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
