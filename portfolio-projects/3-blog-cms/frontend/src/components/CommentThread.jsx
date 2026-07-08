// components/CommentThread.jsx
// Componente recursivo: renderiza um comentário e chama a si mesmo para as respostas
import { useState } from 'react';
import api from '../services/api';
import './CommentThread.css';

export default function CommentThread({ comment, postId, onReplyAdded, depth = 0 }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: replyText,
        parent_id: comment.id,
      });
      setReplyText('');
      setReplying(false);
      onReplyAdded(); // recarrega a árvore de comentários no componente pai
    } catch {
      alert('Erro ao enviar resposta. Faça login e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="comment-thread" style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div className="comment">
        <strong>{comment.author_name}</strong>
        <span className="comment-date">
          {new Date(comment.created_at).toLocaleDateString('pt-BR')}
        </span>
        <p>{comment.content}</p>
        <button className="btn-reply" onClick={() => setReplying(!replying)}>
          {replying ? 'Cancelar' : 'Responder'}
        </button>

        {replying && (
          <form className="reply-form" onSubmit={handleReply}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escreva sua resposta..."
              rows={2}
              autoFocus
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        )}
      </div>

      {/* Chamada recursiva: cada resposta é renderizada usando o mesmo componente */}
      {comment.replies?.map((reply) => (
        <CommentThread
          key={reply.id}
          comment={reply}
          postId={postId}
          onReplyAdded={onReplyAdded}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
