// hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data);
    } catch (err) {
      setError('Não foi possível carregar as tarefas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function createTask(taskData) {
    const { data } = await api.post('/tasks', taskData);
    setTasks((prev) => [data, ...prev]);
    return data;
  }

  async function updateTask(id, taskData) {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }

  async function deleteTask(id) {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleStatus(task) {
    const nextStatus = {
      pending: 'in_progress',
      in_progress: 'done',
      done: 'pending',
    }[task.status];

    return updateTask(task.id, { ...task, status: nextStatus });
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, toggleStatus, refetch: fetchTasks };
}
