-- database.sql
-- Schema do Blog CMS
-- Demonstra: relacionamento auto-referenciado (comentários em árvore), roles/permissões, slugs únicos

CREATE TYPE user_role AS ENUM ('reader', 'author', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role DEFAULT 'reader',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(300),
  author_id INTEGER NOT NULL REFERENCES users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-referência: um comentário pode ser resposta de outro comentário
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- aponta pra própria tabela
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- Usuário admin de exemplo (senha: admin123 -- troque em produção)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@blog.com', '$2a$10$exemplo_hash_bcrypt_aqui', 'admin');
