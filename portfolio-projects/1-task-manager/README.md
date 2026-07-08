# 📋 Task Manager — Gerenciador de Tarefas Full Stack

Aplicação completa de gerenciamento de tarefas com autenticação de usuários, construída para praticar e demonstrar arquitetura full stack real (não é um tutorial copiado — o código foi pensado desde a modelagem do banco até a UX do front-end).

🔗 **Demo ao vivo:** [link-do-deploy-aqui](#)
🎥 **Vídeo demonstrativo:** [link-do-video-aqui](#)

![Preview do projeto](docs/preview.png)

## 💡 Por que esse projeto

Quis sair do "CRUD genérico de tutorial" e resolver problemas reais que aparecem em produção:

- Autenticação segura com **JWT + hash de senha (bcrypt)**, sem bibliotecas prontas de auth.
- Banco relacional com **constraints, ENUMs e índices** pensados para performance de consulta.
- Filtros dinâmicos no back-end (query params) em vez de filtrar tudo no front.
- Hooks customizados no React (`useAuth`, `useTasks`) para separar lógica de UI — arquitetura que escala para times maiores.

## 🛠️ Stack

**Front-end:** React (Hooks + Context API), Axios, CSS puro (sem framework, para mostrar domínio de CSS)
**Back-end:** Node.js, Express
**Banco de dados:** PostgreSQL
**Autenticação:** JWT + bcryptjs

## 🗂️ Estrutura

```
task-manager/
├── backend/
│   ├── server.js          # API REST completa
│   ├── database.sql       # Schema do banco (tabelas, índices, ENUMs)
│   └── package.json
└── frontend/
    └── src/
        ├── hooks/
        │   ├── useAuth.js      # Context de autenticação
        │   └── useTasks.js     # Lógica de CRUD de tarefas
        ├── services/
        │   └── api.js          # Instância axios com interceptors
        ├── components/
        │   ├── TaskCard.jsx
        │   └── TaskForm.jsx
        └── pages/
            └── Dashboard.jsx
```

## ⚙️ Como rodar localmente

### 1. Banco de dados
```bash
# Crie o banco no PostgreSQL
createdb taskmanager

# Rode o schema
psql -d taskmanager -f backend/database.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL e JWT_SECRET
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

A aplicação sobe em `http://localhost:3000` e a API em `http://localhost:3001`.

## 📡 Endpoints da API

| Método | Rota | Descrição | Protegida |
|--------|------|-----------|-----------|
| POST | `/api/auth/register` | Cria usuário | Não |
| POST | `/api/auth/login` | Autentica usuário | Não |
| GET | `/api/tasks?status=&priority=` | Lista tarefas (com filtro) | Sim |
| POST | `/api/tasks` | Cria tarefa | Sim |
| PUT | `/api/tasks/:id` | Atualiza tarefa | Sim |
| DELETE | `/api/tasks/:id` | Remove tarefa | Sim |
| GET | `/api/tasks/stats` | Estatísticas agregadas | Sim |

## 🧠 Decisões técnicas que valem destacar em entrevista

- **Por que JWT sem lib de auth pronta?** Para mostrar que entendo o fluxo (assinatura, expiração, middleware de verificação) e não só "importar e usar".
- **Por que ENUM no Postgres em vez de string livre?** Garante integridade dos dados no nível do banco, não só na aplicação.
- **Por que hooks customizados?** Separa a lógica de fetch/estado da camada visual — os componentes ficam "burros" e fáceis de testar.

## 🚀 Possíveis melhorias futuras

- [ ] Testes automatizados (Jest + Supertest no back, React Testing Library no front)
- [ ] Paginação nas tarefas
- [ ] Drag and drop entre status (estilo Kanban)
- [ ] Notificações de prazo próximo

---
Feito por [Seu Nome] — [LinkedIn](#) · [Portfólio](#)
