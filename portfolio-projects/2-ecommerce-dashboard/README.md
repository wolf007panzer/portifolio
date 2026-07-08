# 📊 Dashboard Analítico de E-commerce

Painel de vendas com métricas em tempo real, construído para demonstrar domínio de **SQL avançado** (JOINs, agregações, triggers) e visualização de dados no front-end.

🔗 **Demo ao vivo:** [link-do-deploy-aqui](#)
🎥 **Vídeo demonstrativo:** [link-do-video-aqui](#)

![Preview do dashboard](docs/preview.png)

## 💡 Por que esse projeto

A maioria dos portfólios mostra CRUD simples. Esse projeto foca no que separa um dev júnior de alguém pronto pra lidar com dados reais: **queries que agregam informação de múltiplas tabelas para gerar insight de negócio**.

Principais desafios técnicos resolvidos:

- Modelagem de banco com relacionamento **N:N via tabela de junção** (`order_items` conecta `orders` e `products`).
- **Trigger no PostgreSQL** que recalcula automaticamente o total do pedido sempre que um item é inserido, editado ou removido — sem depender da aplicação para manter consistência.
- Queries de agregação (`GROUP BY`, `SUM`, `COUNT`, `AVG`) usadas para gerar métricas de negócio direto no banco, evitando processar tudo em JavaScript.
- `unit_price` gravado na tabela de itens do pedido (não referenciado direto do produto) — decisão intencional para preservar o histórico de preço mesmo se o produto mudar de valor depois.

## 🛠️ Stack

**Front-end:** React, Recharts (gráficos), Axios
**Back-end:** Node.js, Express
**Banco de dados:** PostgreSQL (com triggers e funções)

## 🗂️ Estrutura

```
ecommerce-dashboard/
├── backend/
│   ├── server.js       # 6 endpoints analíticos com queries SQL otimizadas
│   └── database.sql    # Schema + trigger de recálculo automático
└── frontend/
    └── src/
        ├── components/
        │   └── KpiCard.jsx
        ├── pages/
        │   └── Dashboard.jsx   # Gráficos de linha, pizza, barras + tabela
        └── services/api.js
```

## ⚙️ Como rodar localmente

```bash
# 1. Banco de dados
createdb ecommerce_dashboard
psql -d ecommerce_dashboard -f backend/database.sql

# 2. Backend
cd backend
npm install
cp .env.example .env
npm run dev

# 3. Frontend
cd frontend
npm install
npm start
```

## 📡 Endpoints da API

| Rota | O que retorna |
|------|----------------|
| `GET /api/dashboard/summary` | Receita total, nº pedidos, clientes, ticket médio |
| `GET /api/dashboard/sales-over-time?days=30` | Série temporal de vendas |
| `GET /api/dashboard/top-products?limit=5` | Produtos mais vendidos por receita |
| `GET /api/dashboard/sales-by-category` | Receita agrupada por categoria |
| `GET /api/dashboard/top-customers?limit=10` | Clientes com maior valor gerado |
| `GET /api/dashboard/low-stock?threshold=10` | Produtos com estoque crítico |

## 🧠 Trecho que costuma gerar boas perguntas em entrevista

```sql
CREATE TRIGGER trg_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_total();
```

Esse trigger garante que `orders.total_amount` **nunca fica dessincronizado** com os itens reais do pedido, mesmo se alguém alterar o banco diretamente via SQL, sem passar pela API. É uma diferença importante entre "confiar na aplicação" e "confiar no banco".

## 🚀 Possíveis melhorias futuras

- [ ] Cache das queries mais pesadas (Redis)
- [ ] Filtro de período customizável no front-end
- [ ] Exportação dos relatórios em PDF/CSV
- [ ] Testes de carga nas queries de agregação

---
Feito por [Seu Nome] — [LinkedIn](#) · [Portfólio](#)
