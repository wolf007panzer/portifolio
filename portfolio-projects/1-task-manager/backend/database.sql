-- database.sql
-- Schema do banco de dados para o Task Manager
-- Demonstra: chaves estrangeiras, constraints, índices, tipos ENUM

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE task_priority AS ENUM ('baixa', 'media', 'alta');

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'media',
  due_date DATE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhorar performance de consultas frequentes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_users_email ON users(email);

-- Dados de exemplo (seed) para testar rapidamente
INSERT INTO users (name, email, password) VALUES
('Usuário Teste', 'teste@email.com', '$2a$10$exemplo_hash_aqui');
