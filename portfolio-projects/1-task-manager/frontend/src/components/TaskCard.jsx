// components/TaskCard.jsx
import { useState } from 'react';
import './TaskCard.css';

const PRIORITY_COLORS = {
  baixa: '#4caf50',
  media: '#ff9800',
  alta: '#f44336',
};

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluída',
};

export default function TaskCard({ task, onToggle, onDelete, onUpdate }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div className={`task-card status-${task.status}`}>
      <div className="task-card-header">
        <span
          className="priority-badge"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
        >
          {task.priority}
        </span>
        {task.due_date && (
          <span className="due-date">
            {new Date(task.due_date).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      <h3>{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-card-footer">
        <button className="btn-status" onClick={onToggle}>
          {STATUS_LABELS[task.status]} →
        </button>
        <button
          className={`btn-delete ${confirmDelete ? 'confirm' : ''}`}
          onClick={handleDelete}
        >
          {confirmDelete ? 'Confirmar?' : 'Excluir'}
        </button>
      </div>
    </div>
  );
}
