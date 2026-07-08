// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---------- KPIs GERAIS ----------
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE status = 'completed') AS total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') AS total_revenue,
        (SELECT COUNT(DISTINCT customer_id) FROM orders) AS total_customers,
        (SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE status = 'completed') AS avg_order_value
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

// ---------- VENDAS POR PERÍODO (para gráfico de linha) ----------
app.get('/api/dashboard/sales-over-time', async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS orders_count,
        SUM(total_amount) AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [days]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vendas por período' });
  }
});

// ---------- TOP PRODUTOS MAIS VENDIDOS (JOIN entre 3 tabelas) ----------
app.get('/api/dashboard/top-products', async (req, res) => {
  const { limit = 5 } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.category,
        COUNT(oi.id) AS times_sold,
        SUM(oi.quantity) AS total_units,
        SUM(oi.quantity * oi.unit_price) AS total_revenue
      FROM products p
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.name, p.category
      ORDER BY total_revenue DESC
      LIMIT $1
      `,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar top produtos' });
  }
});

// ---------- VENDAS POR CATEGORIA (para gráfico de pizza) ----------
app.get('/api/dashboard/sales-by-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.category,
        SUM(oi.quantity * oi.unit_price) AS revenue,
        COUNT(DISTINCT o.id) AS orders_count
      FROM products p
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY p.category
      ORDER BY revenue DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vendas por categoria' });
  }
});

// ---------- MELHORES CLIENTES ----------
app.get('/api/dashboard/top-customers', async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        COUNT(o.id) AS total_orders,
        SUM(o.total_amount) AS lifetime_value
      FROM customers c
      JOIN orders o ON o.customer_id = c.id
      WHERE o.status = 'completed'
      GROUP BY c.id, c.name, c.email
      ORDER BY lifetime_value DESC
      LIMIT $1
      `,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar top clientes' });
  }
});

// ---------- PRODUTOS COM ESTOQUE BAIXO (regra de negócio) ----------
app.get('/api/dashboard/low-stock', async (req, res) => {
  const { threshold = 10 } = req.query;

  try {
    const result = await pool.query(
      `SELECT id, name, category, stock_quantity
       FROM products
       WHERE stock_quantity <= $1
       ORDER BY stock_quantity ASC`,
      [threshold]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estoque baixo' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
