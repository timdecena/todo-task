import { useEffect, useState } from 'react';
import { Alert, Button, Descriptions, Modal, Popconfirm, Space, Spin, Tag, message } from 'antd';
import dayjs from 'dayjs';
import type { TaskResponse } from '../../types/task';
import { deleteTask, getTaskById, markTaskAsCompleted } from '../../services/tasks/taskApi';

/*
  This modal displays full task details, including long text that is truncated in the table list.
  It also lets users complete or delete the task without leaving the current page.
*/
type Props = {
  open: boolean;
  taskId?: number;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: (task: TaskResponse) => void;
};

// Small modal used to view one task.
// It can also complete or delete that task.
const TaskDetailsModal = ({ open, taskId, onClose, onDeleted, onUpdated }: Props) => {
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const hasValidId = typeof taskId === 'number' && taskId > 0;

  // Fetch task whenever modal opens or id changes.
  useEffect(() => {
    const loadTask = async () => {
      if (!open || !hasValidId || !taskId) return;

      setLoading(true);
      try {
        const data = await getTaskById(taskId);
        setTask(data);
      } catch (error: any) {
        setTask(null);
        message.error(error?.response?.data?.message || error?.message || 'Task not found');
      } finally {
        setLoading(false);
      }
    };

    void loadTask();
  }, [open, taskId, hasValidId]);

  const closeModal = () => {
    setTask(null);
    onClose();
  };

  const completeTask = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const updated = await markTaskAsCompleted(taskId);
      setTask(updated);
      onUpdated?.(updated);
      message.success('Task completed');
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      await deleteTask(taskId);
      onDeleted?.();
      message.success('Task deleted');
      closeModal();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Task Details"
      onCancel={closeModal}
      footer={null}
      destroyOnHidden
      centered
      styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
    >
      {!hasValidId && <Alert type="error" message="Invalid task id" showIcon />}

      {loading && !task && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <Spin />
        </div>
      )}

      {!loading && hasValidId && !task && <Alert type="warning" message="Task not found" showIcon />}

      {task && (
        <>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Title">
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{task.title ?? '-'}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{task.description ?? '-'}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">{task.priority ? <Tag>{task.priority}</Tag> : '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">{task.status ? <Tag>{task.status}</Tag> : '-'}</Descriptions.Item>
            <Descriptions.Item label="Deadline">
              {task.deadline ? dayjs(task.deadline).format('MMM DD, YYYY hh:mm A') : '-'}
            </Descriptions.Item>
          </Descriptions>

          <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={closeModal} disabled={loading}>Close</Button>

            <Button
              type="primary"
              onClick={() => void completeTask()}
              disabled={loading || task.status === 'COMPLETED'}
              loading={loading}
            >
              Complete
            </Button>

            <Popconfirm
              title="Delete this task?"
              description="This will remove it from active tasks."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => void removeTask()}
            >
              <Button danger loading={loading}>Delete</Button>
            </Popconfirm>
          </Space>
        </>
      )}
    </Modal>
  );
};

export default TaskDetailsModal;
