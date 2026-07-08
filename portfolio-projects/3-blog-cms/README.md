# ✍️ Blog CMS — Sistema de Publicação com Comentários Aninhados

CMS de blog com sistema de permissões por papel (reader/author/admin) e comentários em árvore (como Reddit/Hacker News), construído para praticar **relacionamentos auto-referenciados** e **controle de acesso**.

🔗 **Demo ao vivo:** [link-do-deploy-aqui](#)
🎥 **Vídeo demonstrativo:** [link-do-video-aqui](#)

![Preview do blog](docs/preview.png)

## 💡 Por que esse projeto

Comentários aninhados (resposta de resposta de resposta...) são um problema clássico de modelagem de dados que aparece bastante em entrevistas técnicas. Resolvi isso com:

- **Relacionamento auto-referenciado** na tabela `comments` (`parent_id` aponta para a própria tabela).
- Função no back-end que transforma a lista plana vinda do banco em **árvore hierárquica** antes de devolver ao front.
- **Componente React recursivo** (`CommentThread`) que renderiza a si mesmo para cada nível de resposta — sem limite de profundidade.
- Sistema de **roles** (`reader`, `author`, `admin`) com middleware de autorização reutilizável, mostrando controle de acesso além do simples "logado ou não".
- **Paginação real no banco** (`LIMIT`/`OFFSET`) em vez de carregar tudo e cortar no front.

## 🛠️ Stack

**Front-end:** React, React Router, Axios
**Back-end:** Node.js, Express
**Banco de dados:** PostgreSQL
**Autenticação:** JWT com roles

## 🗂️ Estrutura

```
blog-cms/
├── backend/
│   ├── server.js       # Auth, posts paginados, comentários em árvore
│   └── database.sql    # Schema com self-reference em comments
└── frontend/
    └── src/
        ├── components/
        │   └── CommentThread.jsx   # Componente recursivo
        ├── pages/
        │   └── PostPage.jsx
        └── services/api.js
```

## ⚙️ Como rodar localmente

```bash
# Banco
createdb blog_cms
psql -d blog_cms -f backend/database.sql

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm start
```

## 📡 Endpoints principais

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| POST | `/api/auth/register` | Cria conta (role padrão: reader) | Pública |
| GET | `/api/posts?page=1&limit=10` | Lista posts paginados | Pública |
| GET | `/api/posts/:slug` | Post + árvore de comentários | Pública |
| POST | `/api/posts` | Cria post | author, admin |
| POST | `/api/posts/:postId/comments` | Comenta ou responde | Autenticado |

## 🧠 O núcleo técnico do projeto: comentários em árvore

**No banco**, cada comentário só sabe quem é seu "pai" direto:
```sql
parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE
```

**No back-end**, transformo a lista plana em árvore com uma função O(n):
```js
function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
  comments.forEach((c) => {
    if (c.parent_id) map[c.parent_id]?.replies.push(map[c.id]);
    else roots.push(map[c.id]);
  });
  return roots;
}
```

**No front-end**, o componente `CommentThread` renderiza a si mesmo para cada resposta, então funciona pra qualquer profundidade de aninhamento sem código extra.

## 🚀 Possíveis melhorias futuras

- [ ] Editor rico (WYSIWYG) para o conteúdo dos posts
- [ ] Sistema de likes em comentários
- [ ] Busca full-text nos posts (PostgreSQL `tsvector`)
- [ ] Upload de imagens (S3 ou Cloudinary)

---
Feito por [Seu Nome] — [LinkedIn](#) · [Portfólio](#)
