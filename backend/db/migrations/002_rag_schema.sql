USE wellness_db;

CREATE TABLE IF NOT EXISTS rag_documents (
  id INT NOT NULL AUTO_INCREMENT,
  source_url VARCHAR(1000) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  content_hash CHAR(64) NOT NULL,
  ingested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rag_documents_file_hash (file_name, content_hash)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rag_chunks (
  id BIGINT NOT NULL AUTO_INCREMENT,
  document_id INT NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rag_chunks_document_index (document_id, chunk_index),
  KEY idx_rag_chunks_document (document_id),
  CONSTRAINT fk_rag_chunks_document FOREIGN KEY (document_id)
    REFERENCES rag_documents (id) ON DELETE CASCADE
) ENGINE=InnoDB;
