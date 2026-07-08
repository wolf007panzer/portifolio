// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_chave_em_producao';

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// ---------- ROTAS DE AUTENTICAÇÃO ----------

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ---------- ROTAS DE TAREFAS (protegidas) ----------

app.get('/api/tasks', authMiddleware, async (req, res) => {
  const { status, priority } = req.query;

  let query = 'SELECT * FROM tasks WHERE user_id = $1';
  const params = [req.userId];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (priority) {
    params.push(priority);
    query += ` AND priority = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  const { title, description, priority, due_date } = req.body;

  if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_date, status, user_id)
       VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
      [title, description || null, priority || 'media', due_date || null, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, due_date } = req.body;

  try {
    const check = await pool.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4, due_date = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, description, priority, status, due_date, id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json({ message: 'Tarefa removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
});

// Estatísticas (mostra domínio de agregação SQL)
app.get('/api/tasks/stats', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*) as total FROM tasks WHERE user_id = $1 GROUP BY status`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
