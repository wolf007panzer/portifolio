// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_chave';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Não autenticado' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware que só deixa passar autores/admins
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Você não tem permissão para essa ação' });
    }
    next();
  };
}

// ---------- AUTH ----------
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'reader')
       RETURNING id, name, email, role`,
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' });
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

// ---------- POSTS (com paginação) ----------
app.get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const posts = await pool.query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.created_at, u.name AS author_name,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.published = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM posts WHERE published = true');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      posts: posts.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const postResult = await pool.query(
      `SELECT p.*, u.name AS author_name FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.slug = $1 AND p.published = true`,
      [req.params.slug]
    );
    if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post não encontrado' });

    const post = postResult.rows[0];

    // Busca comentários com suporte a respostas aninhadas (comment_id como self-reference)
    const commentsResult = await pool.query(
      `SELECT c.id, c.content, c.parent_id, c.created_at, u.name AS author_name
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [post.id]
    );

    res.json({ ...post, comments: buildCommentTree(commentsResult.rows) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar post' });
  }
});

// Transforma lista plana de comentários em árvore (respostas dentro de respostas)
function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
  comments.forEach((c) => {
    if (c.parent_id) {
      map[c.parent_id]?.replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

app.post('/api/posts', auth, requireRole('author', 'admin'), async (req, res) => {
  const { title, content, excerpt } = req.body;
  const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  try {
    const result = await pool.query(
      `INSERT INTO posts (title, slug, content, excerpt, author_id, published)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [title, slug, content, excerpt, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um post com esse título' });
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

// ---------- COMENTÁRIOS ----------
app.post('/api/posts/:postId/comments', auth, async (req, res) => {
  const { content, parent_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO comments (content, post_id, author_id, parent_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [content, req.params.postId, req.user.id, parent_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao comentar' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
