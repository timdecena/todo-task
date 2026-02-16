import { useCallback, useEffect, useRef, useState } from 'react';
import type { TaskResponse } from '../../types/task';
import { getDeletedTasks } from '../../services/tasks/taskApi';

/*
  This custom hook loads and stores soft-deleted tasks for the deleted list page.
  It reuses the same paging pattern as active tasks so behavior stays predictable.
*/
const PAGE_SIZE = 100;
const MAX_PAGES = 1000;

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
  const fetchVersionRef = useRef(0);

  // Show a short message.
  const showNotice = (msg: string): void => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 2500);
  };

  // Pull all deleted rows from backend pages.
  const fetchDeletedTasks = useCallback(async (): Promise<void> => {
    const fetchVersion = ++fetchVersionRef.current;
    setLoading(true);
    let loadingReleased = false;

    const isStale = (): boolean => fetchVersion !== fetchVersionRef.current;

    try {
      const firstPage = await getDeletedTasks({ page: 0, size: PAGE_SIZE });
      if (isStale()) return;

      const rows: TaskResponse[] = [...firstPage];
      setTasks(rows);
      setLoading(false);
      loadingReleased = true;

      if (firstPage.length < PAGE_SIZE) return;

      let page = 1;
      while (page <= MAX_PAGES) {
        const data = await getDeletedTasks({ page, size: PAGE_SIZE });

        if (isStale()) return;
        if (!data.length) break;

        rows.push(...data);

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
      showNotice(readErrorMessage(error, 'Failed to load deleted tasks'));
    } finally {
      if (!isStale() && !loadingReleased) {
        setLoading(false);
      }
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
