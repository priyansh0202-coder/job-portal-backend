-- schema.sql

-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- jobs table
-- CREATE TABLE IF NOT EXISTS jobs (
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(255) NOT NULL,
--   company VARCHAR(255),
--   location VARCHAR(255),
--   description TEXT,
--   salary VARCHAR(100),
--   posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );
