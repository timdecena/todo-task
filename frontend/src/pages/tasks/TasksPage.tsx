import React, { useMemo } from 'react';
import { Button, Card, Layout, Space, Typography, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import TaskTable from '../../components/tasks/TaskTable';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import type { TaskRequest, TaskResponse } from '../../types/task';
import useTasks from '../../hooks/tasks/useTasks';

const { Content } = Layout;
const { Title, Text } = Typography;

/**
 * TasksPage Component
 *
 * Summary:
 * - Full-width dashboard layout.
 * - Client-side pagination + sorting + search in table.
 * - Modal open/edit state is managed by the hook.
 *
 * Return:
 * - JSX.Element
 */
const TasksPage: React.FC = () => {
  const {
    tasks,
    loading,
    notice,

    // modal/editing
    modalOpen,
    editingTask,
    openCreate,
    closeForm,

    // actions
    handleEdit,
    handleDelete,
    handleComplete,
    handleSubmit,
  } = useTasks();

  /**
   * Maps TaskResponse -> TaskRequest for edit mode.
   */
  const toTaskRequest = (task: TaskResponse | null): TaskRequest | undefined => {
    if (!task) return undefined;
    return {
      title: task.title ?? '',
      description: task.description ?? '',
      priority: task.priority as 'HIGH' | 'MODERATE' | 'LOW' | undefined,
      status: task.status as 'PENDING' | 'COMPLETED' | undefined,
      deadline: task.deadline,
    };
  };

  /**
   * Footer stats (current tasks list).
   */
  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pending = tasks.filter((t) => t.status === 'PENDING').length;

    return {
      total: tasks.length,
      completed,
      pending,
    };
  }, [tasks]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: 16 }}>
        <Card variant="borderless" styles={{ body: { padding: 16 } }}>
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            {/* Centered header */}
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>
                Task Manager
              </Title>
              <Text type="secondary">Manage your tasks efficiently and effectively</Text>
            </div>

            {/* Action row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Button type="primary" size="large" onClick={openCreate}>
                Create Task
              </Button>
            </div>

            {/* Notice */}
            {notice && (
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message={notice}
              />
            )}

            {/* Table with client-side sorting + pagination + search */}
            <TaskTable
              tasks={tasks}
              loading={loading}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onComplete={handleComplete}
            />

            {/* Footer stats */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                flexWrap: 'wrap',
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Text type="secondary">
                Total tasks: <Text strong>{stats.total}</Text>
              </Text>
              <Text type="secondary">
                Completed: <Text strong>{stats.completed}</Text>
              </Text>
              <Text type="secondary">
                Pending: <Text strong>{stats.pending}</Text>
              </Text>
            </div>
          </Space>
        </Card>

        {/* Modal controlled by hook */}
        <TaskFormModal
          open={modalOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          initialValues={toTaskRequest(editingTask)}
        />
      </Content>
    </Layout>
  );
};

export default TasksPage;
