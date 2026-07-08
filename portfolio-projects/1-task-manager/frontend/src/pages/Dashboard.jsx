// pages/Dashboard.jsx
import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import './Dashboard.css';

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluída',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleStatus } = useTasks(
    statusFilter ? { status: statusFilter } : {}
  );

  async function handleCreate(taskData) {
    try {
      await createTask(taskData);
      setShowForm(false);
    } catch {
      alert('Erro ao criar tarefa. Verifique os dados e tente novamente.');
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Minhas Tarefas</h1>
          <p>Olá, {user?.name}</p>
        </div>
        <button className="btn-logout" onClick={logout}>Sair</button>
      </header>

      <div className="dashboard-controls">
        <div className="filters">
          {['', 'pending', 'in_progress', 'done'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status ? STATUS_LABELS[status] : 'Todas'}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nova Tarefa
        </button>
      </div>

      {showForm && (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {loading && <p className="info-text">Carregando tarefas...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && tasks.length === 0 && (
        <p className="info-text">Nenhuma tarefa encontrada. Que tal criar a primeira?</p>
      )}

      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() => toggleStatus(task)}
            onDelete={() => deleteTask(task.id)}
            onUpdate={(data) => updateTask(task.id, data)}
          />
        ))}
      </div>
    </div>
  );
}
