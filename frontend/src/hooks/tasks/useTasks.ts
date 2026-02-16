import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { TaskRequest, TaskResponse } from '../../types/task';
import {
  getAllTasks,
  createTask,
  updateTask,
  markTaskAsCompleted,
} from '../../services/tasks/taskApi';
import useUndoDelete from './useUndoDelete';

/*
  This custom hook contains the main CRUD logic for active tasks.
  It keeps page components simple by handling API calls, local state, and UI feedback in one place.
*/
const PAGE_SIZE = 100;
const MAX_PAGES = 1000;

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
  const fetchVersionRef = useRef(0);

  // Show a message for a short time.
  const showNotice = (msg: string): void => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 2500);
  };

  // Pull all tasks from backend pages and merge into one array.
  const fetchTasks = useCallback(async (): Promise<void> => {
    const fetchVersion = ++fetchVersionRef.current;
    setLoading(true);
    let loadingReleased = false;

    const isStale = (): boolean => fetchVersion !== fetchVersionRef.current;

    try {
      const firstPage = await getAllTasks({
        page: 0,
        size: PAGE_SIZE,
        sortBy: 'dateCreated',
        sortDir: 'desc',
      });

      if (isStale()) return;

      const rows: TaskResponse[] = [...firstPage];
      setTasks(rows);
      setLoading(false);
      loadingReleased = true;

      if (firstPage.length < PAGE_SIZE) return;

      let page = 1;
      while (page <= MAX_PAGES) {
        const data = await getAllTasks({
          page,
          size: PAGE_SIZE,
          sortBy: 'dateCreated',
          sortDir: 'desc',
        });

        if (isStale()) return;
        if (!data.length) break;

        rows.push(...data);

        // Progressive rendering keeps UI responsive on large data sets.
        if (page % 2 === 0 || data.length < PAGE_SIZE) {
          setTasks([...rows]);
        }

        if (data.length < PAGE_SIZE) break;
        page += 1;
      }
    } catch (error: unknown) {
      if (isStale()) return;
      if (!loadingReleased) {
        setTasks([]);
      }
      showNotice(readErrorMessage(error, 'Failed to load tasks'));
    } finally {
      if (!isStale() && !loadingReleased) {
        setLoading(false);
      }
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
    const targetTask = tasks.find((task) => task.id === id);
    if (!targetTask) {
      message.error('Task not found');
      return;
    }

    await deleteWithUndo(targetTask);
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

  const { deleteWithUndo } = useUndoDelete({
    onOptimisticRemove: (id) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    onRestoreLocal: (task) => {
      setTasks((prev) => {
        if (prev.some((item) => item.id === task.id)) {
          return prev;
        }
        return [task, ...prev];
      });
    },
    onDeleteFailedRestore: (task) => {
      setTasks((prev) => {
        if (prev.some((item) => item.id === task.id)) {
          return prev;
        }
        return [task, ...prev];
      });
    },
  });

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
