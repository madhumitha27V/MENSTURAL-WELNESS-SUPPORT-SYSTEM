CREATE DATABASE IF NOT EXISTS wellness_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wellness_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password VARCHAR(255) NOT NULL,
  age TINYINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cycles (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  flow_intensity ENUM('light', 'medium', 'heavy') NULL,
  notes VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cycles_user_start (user_id, start_date),
  CONSTRAINT fk_cycles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS symptoms (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  mood ENUM('happy', 'sad', 'anxious', 'angry', 'calm', 'tired') NULL,
  pain_level TINYINT UNSIGNED NULL,
  symptoms VARCHAR(1000) NULL,
  water_intake DECIMAL(5,2) NULL,
  sleep_hours DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_symptoms_user_date (user_id, date),
  CONSTRAINT fk_symptoms_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chat_history_user_created (user_id, created_at),
  CONSTRAINT fk_chat_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
