import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import type { TaskRequest, TaskResponse } from '../../types/task';
import {
  getAllTasks,
  createTask,
  deleteTask,
  updateTask,
  markTaskAsCompleted,
} from '../../services/tasks/taskApi';

/*
  This custom hook contains the main CRUD logic for active tasks.
  It keeps page components simple by handling API calls, local state, and UI feedback in one place.
*/
const PAGE_SIZE = 100;

const readErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: string }).message || fallback);
  }
  return fallback;
};

const useTasks = () => {
  // List state.
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Create/edit modal state.
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  // Small message shown at top of page.
  const [notice, setNotice] = useState<string>('');

  // Show a message for a short time.
  const showNotice = (msg: string): void => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 2500);
  };

  // Pull all tasks from backend pages and merge into one array.
  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const rows: TaskResponse[] = [];
      let page = 0;

      while (true) {
        const data = await getAllTasks({
          page,
          size: PAGE_SIZE,
          sortBy: 'dateCreated',
          sortDir: 'desc',
        });

        rows.push(...data);

        if (data.length < PAGE_SIZE) break;
        page += 1;
        if (page > 1000) break;
      }

      setTasks(rows);
    } catch (error: unknown) {
      setTasks([]);
      showNotice(readErrorMessage(error, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once when page opens.
  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  // Open modal and preload selected row.
  const handleEdit = (task: TaskResponse): void => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // Create when there is no editing task. Update when editing task exists.
  const handleSubmit = async (values: TaskRequest): Promise<void> => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        message.success('Task updated successfully');
      } else {
        await createTask(values);
        message.success('Task created successfully');
      }

      setModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (error: unknown) {
      showNotice(readErrorMessage(error, 'Failed to save task'));
    }
  };

  // Soft delete.
  const handleDelete = async (id: number): Promise<void> => {
    try {
      await deleteTask(id);
      message.success('Task deleted successfully');
      await fetchTasks();
    } catch (error: unknown) {
      message.error(readErrorMessage(error, 'Failed to delete task'));
    }
  };

  // Mark as completed.
  const handleComplete = async (id: number): Promise<void> => {
    try {
      await markTaskAsCompleted(id);
      message.success('Task marked as completed');
      await fetchTasks();
    } catch (error: unknown) {
      message.error(readErrorMessage(error, 'Failed to complete task'));
    }
  };

  // Open blank form.
  const openCreate = (): void => {
    setEditingTask(null);
    setModalOpen(true);
  };

  // Close modal and clear edit mode.
  const closeForm = (): void => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return {
    tasks,
    loading,
    notice,
    modalOpen,
    editingTask,
    handleEdit,
    handleDelete,
    handleComplete,
    handleSubmit,
    openCreate,
    closeForm,
    refreshTasks: fetchTasks,
  };
};

export default useTasks;
