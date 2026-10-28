require('dotenv').config();
const { performance } = require('perf_hooks');
const questions = require('./evaluationQuestions');
const { searchKnowledgeBase } = require('./retrieve');
const db = require('../config/db');

const topK = Number(process.env.RAG_EVAL_TOP_K || 4);
const threshold = Number(process.env.RAG_EVAL_THRESHOLD || 0.45);

const evaluate = async () => {
  const results = [];
  let totalLatency = 0;
  let errors = 0;

  for (const sample of questions) {
    const startedAt = performance.now();
    try {
      const matches = await searchKnowledgeBase({ query: sample.question, topK, threshold });
      const latencyMs = performance.now() - startedAt;
      totalLatency += latencyMs;
      results.push({
        question: sample.question,
        expectedSource: sample.expectedSource,
        inScope: Boolean(sample.expectedSource),
        hit: sample.expectedSource
          ? matches.some((match) => match.url === sample.expectedSource)
          : matches.length === 0,
        outOfScopeRefusal: !sample.expectedSource && matches.length === 0,
        latencyMs: Number(latencyMs.toFixed(2)),
        matches: matches.map((match) => ({ title: match.title, url: match.url, score: Number(match.score.toFixed(3)) })),
      });
    } catch (error) {
      errors += 1;
      results.push({
        question: sample.question,
        expectedSource: sample.expectedSource,
        hit: false,
        error: error.message,
      });
    }
  }

  const hits = results.filter((result) => result.hit).length;
  const inScopeResults = results.filter((result) => result.inScope);
  const outOfScopeResults = results.filter((result) => !result.inScope);
  const inScopeHits = inScopeResults.filter((result) => result.hit).length;
  const outOfScopeRefusals = outOfScopeResults.filter((result) => result.outOfScopeRefusal).length;
  const measured = questions.length - errors;
  const report = {
    questionCount: questions.length,
    inScopeQuestionCount: inScopeResults.length,
    outOfScopeQuestionCount: outOfScopeResults.length,
    topK,
    threshold,
    hitRateAtK: Number((inScopeHits / inScopeResults.length).toFixed(4)),
    outOfScopeEmptyRetrievalRate: Number((outOfScopeRefusals / outOfScopeResults.length).toFixed(4)),
    overallExpectedBehaviorRate: Number((hits / questions.length).toFixed(4)),
    averageLatencyMs: measured ? Number((totalLatency / measured).toFixed(2)) : null,
    errors,
    results,
  };

  console.log(JSON.stringify(report, null, 2));
  if (errors > 0) process.exitCode = 1;
  return report;
};

if (require.main === module) {
  evaluate().catch((error) => {
    console.error(`RAG evaluation failed: ${error.message}`);
    process.exitCode = 1;
  }).finally(() => {
    db.promise().end().catch((error) => {
      console.error(`Unable to close database pool: ${error.message}`);
      process.exitCode = 1;
    });
  });
}

module.exports = { evaluate };
