const crypto = require('crypto');
const db = require('../config/db');

const hashContent = (content) => crypto.createHash('sha256').update(content).digest('hex');

const replaceDocument = async ({ sourceUrl, title, fileName, chunks }) => {
  const contentHash = hashContent(chunks.map((chunk) => chunk.content).join('\n'));
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      'SELECT id FROM rag_documents WHERE file_name = ? AND content_hash = ? LIMIT 1',
      [fileName, contentHash],
    );

    if (existing.length > 0) {
      await connection.commit();
      return { documentId: existing[0].id, inserted: false, chunkCount: 0 };
    }

    await connection.query('DELETE FROM rag_documents WHERE file_name = ?', [fileName]);
    const [documentResult] = await connection.query(
      'INSERT INTO rag_documents (source_url, title, file_name, content_hash) VALUES (?, ?, ?, ?)',
      [sourceUrl, title, fileName, contentHash],
    );

    for (const chunk of chunks) {
      await connection.query(
        'INSERT INTO rag_chunks (document_id, chunk_index, content, embedding) VALUES (?, ?, ?, ?)',
        [documentResult.insertId, chunk.chunkIndex, chunk.content, JSON.stringify(chunk.embedding)],
      );
    }

    await connection.commit();
    return { documentId: documentResult.insertId, inserted: true, chunkCount: chunks.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const loadChunks = async () => {
  const [rows] = await db.promise().query(
    `SELECT c.id, c.content, c.embedding, d.title, d.source_url, c.chunk_index
     FROM rag_chunks c
     JOIN rag_documents d ON d.id = c.document_id`,
  );

  return rows.map((row) => ({
    ...row,
    embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding,
  }));
};

module.exports = { replaceDocument, loadChunks };
