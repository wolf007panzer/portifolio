# 👋 [Randley/wolf] — Desenvolvedor Front End

Portfólio com 3 projetos autorais construídos para demonstrar competências que empresas realmente buscam: **modelagem de banco de dados relacional, arquitetura de API REST e front-end com estado bem gerenciado.**

Cada projeto resolve um problema técnico específico e diferente dos outros — não são variações do mesmo CRUD.

📧 **Contato:** randleysantos1l@email.com
💼 **LinkedIn:** www.linkedin.com/in/randleyray
🌐 **outro contato:** 31971823997 (whatsApp/telefone)

---

## 📁 Projetos

### 1. [Task Manager](./1-task-manager) — Autenticação e CRUD completo
**Stack:** React · Node.js/Express · PostgreSQL · JWT

Gerenciador de tarefas com autenticação própria (JWT + bcrypt, sem lib pronta), hooks customizados no React (`useAuth`, `useTasks`) e filtros dinâmicos direto na query SQL.

**O que esse projeto prova:** domínio do ciclo completo de autenticação e organização de estado no front-end sem depender de bibliotecas de gerenciamento externas.

---

### 2. [Dashboard de E-commerce](./2-ecommerce-dashboard) — SQL avançado e visualização de dados
**Stack:** React · Recharts · Node.js/Express · PostgreSQL (triggers)

Painel analítico com métricas calculadas via `JOIN`, `GROUP BY` e agregações direto no banco. Inclui um **trigger PostgreSQL** que mantém o total do pedido sempre sincronizado automaticamente, no nível do banco de dados.

**O que esse projeto prova:** capacidade de extrair informação de negócio de dados relacionais complexos — competência que separa quem só faz CRUD de quem entende banco de dados de verdade.

---

### 3. [Blog CMS](./3-blog-cms) — Relacionamento auto-referenciado e permissões
**Stack:** React · React Router · Node.js/Express · PostgreSQL

Sistema de blog com comentários aninhados infinitamente (como Reddit) usando relacionamento auto-referenciado no banco, componente React recursivo no front, sistema de roles (`reader`/`author`/`admin`) e paginação real via `LIMIT`/`OFFSET`.

**O que esse projeto prova:** capacidade de modelar estruturas de dados hierárquicas e implementar controle de acesso granular.

---

## 🛠️ Tecnologias usadas nos três projetos

| Categoria | Tecnologias |
|-----------|-------------|
| Front-end | React (Hooks, Context API), React Router, Recharts |
| Back-end | Node.js, Express |
| Banco de dados | PostgreSQL (índices, triggers, ENUMs, constraints) |
| Autenticação | JWT, bcrypt |
| Ferramentas | Git, Axios, dotenv |

## 🧭 Como navegar neste portfólio

Cada pasta de projeto tem seu próprio `README.md` com:
- Justificativa técnica das decisões de arquitetura
- Instruções para rodar localmente
- Documentação dos endpoints da API
- Trechos de código comentados que costumam gerar boas perguntas em entrevista

---

*Portfólio em constante atualização. Última revisão: julho de 2026.*
