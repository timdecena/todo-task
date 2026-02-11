import { useCallback, useEffect, useState } from 'react';
import type { TaskResponse } from '../../types/task';
import { getDeletedTasks } from '../../services/tasks/taskApi';

/*
  This custom hook loads and stores soft-deleted tasks for the deleted list page.
  It reuses the same paging pattern as active tasks so behavior stays predictable.
*/
const PAGE_SIZE = 100;

const readErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: string }).message || fallback);
  }
  return fallback;
};

const useDeletedTasks = () => {
  // Deleted tasks list state.
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');

  // Show a short message.
  const showNotice = (msg: string): void => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 2500);
  };

  // Pull all deleted rows from backend pages.
  const fetchDeletedTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const rows: TaskResponse[] = [];
      let page = 0;

      while (true) {
        const data = await getDeletedTasks({ page, size: PAGE_SIZE });
        rows.push(...data);

        if (data.length < PAGE_SIZE) break;
        page += 1;
        if (page > 1000) break;
      }

      setTasks(rows);
    } catch (error: unknown) {
      setTasks([]);
      showNotice(readErrorMessage(error, 'Failed to load deleted tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once when page opens.
  useEffect(() => {
    void fetchDeletedTasks();
  }, [fetchDeletedTasks]);

  return {
    tasks,
    loading,
    notice,
    refreshDeletedTasks: fetchDeletedTasks,
  };
};

export default useDeletedTasks;
