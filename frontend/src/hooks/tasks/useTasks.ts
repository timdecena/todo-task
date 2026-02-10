import { useEffect, useState, useCallback } from 'react';
import type { TaskRequest, TaskResponse } from '../../types/task';
import {
  getAllTasks,
  createTask,
  deleteTask,
  updateTask,
  markTaskAsCompleted,
} from '../../services/tasks/taskApi';

const useTasks = () => {
  /* ===================== STATE ===================== */

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  const [notice, setNotice] = useState<string>('');

  /* ===================== HELPERS ===================== */

  /**
   * Shows a temporary notice message.
   */
  const showNotice = (msg: string): void => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 2500);
  };

  /* ===================== FETCH ===================== */

  /**
   * Fetches all tasks by paging through the backend.
   */
  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const all: TaskResponse[] = [];
      const pageSize = 100;
      let page = 0;

      while (true) {
        const data = await getAllTasks({
          page,
          size: pageSize,
          sortBy: 'dateCreated',
          sortDir: 'desc',
        });

        all.push(...data);

        if (data.length < pageSize) break;
        page += 1;

        if (page > 1000) break; // safety cap
      }

      setTasks(all);
    } catch (err: any) {
      setTasks([]);
      showNotice(err?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load tasks on initial render.
   */
  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  /* ===================== ACTIONS ===================== */

  /**
   * Opens form in edit mode.
   */
  const handleEdit = (task: TaskResponse): void => {
    setEditingTask(task);
    setModalOpen(true);
  };

  /**
   * Creates or updates a task.
   */
  const handleSubmit = async (values: TaskRequest): Promise<void> => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        showNotice('Task updated successfully');
      } else {
        await createTask(values);
        showNotice('Task created successfully');
      }

      setModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err: any) {
      showNotice(err?.message || 'Operation failed');
    }
  };

  /**
   * Deletes a task.
   */
  const handleDelete = async (id: number): Promise<void> => {
    try {
      await deleteTask(id);
      showNotice('Task deleted successfully');
      await fetchTasks();
    } catch (err: any) {
      showNotice(err?.message || 'Failed to delete task');
    }
  };

  /**
   * Marks a task as completed.
   */
  const handleComplete = async (id: number): Promise<void> => {
    try {
      await markTaskAsCompleted(id);
      showNotice('Task marked as completed');
      await fetchTasks();
    } catch (err: any) {
      showNotice(err?.message || 'Failed to complete task');
    }
  };

  /**
   * Opens form in create mode.
   */
  const openCreate = (): void => {
    setEditingTask(null);
    setModalOpen(true);
  };

  /**
   * Closes form and clears edit state.
   */
  const closeForm = (): void => {
    setModalOpen(false);
    setEditingTask(null);
  };

  /* ===================== RETURN ===================== */

  return {
    // data
    tasks,
    loading,
    notice,

    // ui/actions
    modalOpen,
    editingTask,
    handleEdit,
    handleDelete,
    handleComplete,
    handleSubmit,
    openCreate,
    closeForm,
  };
};

export default useTasks;
