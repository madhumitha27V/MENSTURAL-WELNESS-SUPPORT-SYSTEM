require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { chunkText } = require('./chunk');
const { embedText } = require('./embed');
const { replaceDocument } = require('./store');
const db = require('../config/db');

const KNOWLEDGE_BASE_DIR = path.resolve(__dirname, '../../knowledge-base');

const parseMarkdown = (content, fileName) => {
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.basename(fileName, path.extname(fileName));
  const sourceUrl = content.match(/^source:\s*(\S+)$/m)?.[1]?.trim();
  const body = content.replace(/^source:\s*\S+\s*$/m, '').replace(/^#\s+.+$/m, '').trim();

  if (!sourceUrl) throw new Error(`${fileName} must include a source URL`);
  if (!body) throw new Error(`${fileName} has no ingestible content`);
  return { title, sourceUrl, body };
};

const parsePdf = async (filePath, fileName) => {
  const metadataPath = `${filePath}.json`;
  let metadata;
  try {
    metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`${fileName} requires a sidecar metadata file at ${path.basename(metadataPath)}`);
    }
    throw new Error(`Invalid PDF metadata for ${fileName}: ${error.message}`);
  }

  if (!metadata.sourceUrl || !metadata.title) {
    throw new Error(`${path.basename(metadataPath)} must include title and sourceUrl`);
  }

  const parser = new PDFParse({ data: await fs.readFile(filePath) });
  try {
    const result = await parser.getText();
    return { title: metadata.title, sourceUrl: metadata.sourceUrl, body: result.text };
  } finally {
    await parser.destroy();
  }
};

const ingestKnowledgeBase = async () => {
  const files = (await fs.readdir(KNOWLEDGE_BASE_DIR))
    .filter((fileName) => /\.(md|pdf)$/i.test(fileName))
    .sort();
  const results = [];

  for (const fileName of files) {
    const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
    const parsed = fileName.toLowerCase().endsWith('.pdf')
      ? await parsePdf(filePath, fileName)
      : parseMarkdown(await fs.readFile(filePath, 'utf8'), fileName);
    const chunks = chunkText(parsed.body);

    for (const chunk of chunks) {
      chunk.embedding = await embedText(chunk.content);
    }

    results.push({
      fileName,
      ...(await replaceDocument({ ...parsed, fileName, chunks })),
    });
  }

  return results;
};

if (require.main === module) {
  ingestKnowledgeBase()
    .then((results) => {
      console.log(JSON.stringify({ documents: results }, null, 2));
    })
    .catch((error) => {
      console.error(`RAG ingestion failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => {
      db.promise().end().catch((error) => {
        console.error(`Unable to close database pool: ${error.message}`);
        process.exitCode = 1;
      });
    });
}

module.exports = { ingestKnowledgeBase, parseMarkdown };
