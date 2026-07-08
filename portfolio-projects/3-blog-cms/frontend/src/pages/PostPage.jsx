// pages/PostPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import CommentThread from '../components/CommentThread';
import './PostPage.css';

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const loadPost = useCallback(async () => {
    try {
      const { data } = await api.get(`/posts/${slug}`);
      setPost(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function handleNewComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/posts/${post.id}/comments`, { content: newComment });
      setNewComment('');
      loadPost(); // recarrega para mostrar o comentário novo na árvore
    } catch {
      alert('Faça login para comentar.');
    }
  }

  if (loading) return <p className="loading">Carregando post...</p>;
  if (!post) return <p className="loading">Post não encontrado.</p>;

  return (
    <article className="post-page">
      <h1>{post.title}</h1>
      <p className="post-meta">
        Por {post.author_name} · {new Date(post.created_at).toLocaleDateString('pt-BR')}
      </p>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <section className="comments-section">
        <h2>Comentários ({post.comments.length})</h2>

        <form className="new-comment-form" onSubmit={handleNewComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Deixe seu comentário..."
            rows={3}
          />
          <button type="submit">Comentar</button>
        </form>

        {post.comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            postId={post.id}
            onReplyAdded={loadPost}
          />
        ))}
      </section>
    </article>
  );
}
