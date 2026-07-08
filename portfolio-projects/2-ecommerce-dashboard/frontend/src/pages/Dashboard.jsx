// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import './Dashboard.css';

const COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryRes, salesRes, productsRes, categoryRes, customersRes, stockRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/sales-over-time?days=30'),
          api.get('/dashboard/top-products?limit=5'),
          api.get('/dashboard/sales-by-category'),
          api.get('/dashboard/top-customers?limit=5'),
          api.get('/dashboard/low-stock?threshold=10'),
        ]);

        setSummary(summaryRes.data);
        setSalesOverTime(salesRes.data);
        setTopProducts(productsRes.data);
        setSalesByCategory(categoryRes.data);
        setTopCustomers(customersRes.data);
        setLowStock(stockRes.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <div className="loading-screen">Carregando dashboard...</div>;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="dashboard">
      <h1>Dashboard de Vendas</h1>

      <div className="kpi-grid">
        <KpiCard label="Receita Total" value={formatCurrency(summary.total_revenue)} icon="💰" />
        <KpiCard label="Pedidos Concluídos" value={summary.total_orders} icon="📦" />
        <KpiCard label="Clientes" value={summary.total_customers} icon="👥" />
        <KpiCard label="Ticket Médio" value={formatCurrency(summary.avg_order_value)} icon="🧾" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Vendas nos últimos 30 dias</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#6c5ce7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Vendas por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={salesByCategory}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ category }) => category}
              >
                {salesByCategory.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Top 5 Produtos por Receita</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="total_revenue" fill="#00b894" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Melhores Clientes</h2>
          <table className="data-table">
            <thead>
              <tr><th>Cliente</th><th>Pedidos</th><th>Valor Total</th></tr>
            </thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.total_orders}</td>
                  <td>{formatCurrency(c.lifetime_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert-card">
          <h2>⚠️ Produtos com estoque baixo</h2>
          <ul>
            {lowStock.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong> — apenas {p.stock_quantity} unidades restantes
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
