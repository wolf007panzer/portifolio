// components/TaskForm.jsx
import { useState } from 'react';
import './TaskForm.css';

export default function TaskForm({ onSubmit, onCancel, initialData = {} }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'media',
    due_date: initialData.due_date || '',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Título da tarefa"
        value={form.title}
        onChange={handleChange}
        required
        autoFocus
      />
      <textarea
        name="description"
        placeholder="Descrição (opcional)"
        value={form.description}
        onChange={handleChange}
        rows={3}
      />
      <div className="task-form-row">
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="baixa">Baixa prioridade</option>
          <option value="media">Média prioridade</option>
          <option value="alta">Alta prioridade</option>
        </select>
        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
        />
      </div>
      <div className="task-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar Tarefa'}
        </button>
      </div>
    </form>
  );
}
