import { useRef } from 'react';
import { Button, message } from 'antd';
import type { TaskResponse } from '../../types/task';
import { deleteTask, restoreTask } from '../../services/tasks/taskApi';

type UseUndoDeleteOptions = {
  onOptimisticRemove: (id: number) => void;
  onRestoreLocal: (task: TaskResponse) => void;
  onDeleteFailedRestore: (task: TaskResponse) => void;
};

const UNDO_DURATION_SECONDS = 6;

const readErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: string }).message || fallback);
  }
  return fallback;
};

/**
 * Provides optimistic delete with temporary undo action.
 *
 * @param options callbacks for local state updates
 * @returns delete function with undo behavior
 */
const useUndoDelete = (options: UseUndoDeleteOptions) => {
  const pendingDeleteIdsRef = useRef<Set<number>>(new Set<number>());

  /**
   * Deletes a task and shows Undo action for a short window.
   *
   * @param task task snapshot before deletion
   * @returns promise resolved when initial delete request finishes
   */
  const deleteWithUndo = async (task: TaskResponse): Promise<void> => {
    if (pendingDeleteIdsRef.current.has(task.id)) {
      return;
    }

    options.onOptimisticRemove(task.id);

    try {
      await deleteTask(task.id);
      pendingDeleteIdsRef.current.add(task.id);

      const messageKey = `undo-delete-${task.id}-${Date.now()}`;

      const undoDelete = async (): Promise<void> => {
        if (!pendingDeleteIdsRef.current.has(task.id)) {
          return;
        }

        try {
          const restored = await restoreTask(task.id);
          pendingDeleteIdsRef.current.delete(task.id);
          message.destroy(messageKey);
          options.onRestoreLocal(restored);
          message.success('Task restored');
        } catch (error: unknown) {
          message.error(readErrorMessage(error, 'Failed to restore task'));
        }
      };

      message.open({
        key: messageKey,
        type: 'success',
        duration: UNDO_DURATION_SECONDS,
        content: (
          <span>
            Task deleted.{' '}
            <Button
              type="link"
              size="small"
              onClick={() => {
                void undoDelete();
              }}
              style={{ paddingInline: 0 }}
            >
              Undo
            </Button>
          </span>
        ),
        onClose: () => {
          pendingDeleteIdsRef.current.delete(task.id);
        },
      });
    } catch (error: unknown) {
      options.onDeleteFailedRestore(task);
      message.error(readErrorMessage(error, 'Failed to delete task'));
    }
  };

  return { deleteWithUndo };
};

export default useUndoDelete;
