import { useMemo, useState } from 'react';
import { Alert, Button, Card, Layout, Space, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import TaskTable from '../../components/tasks/TaskTable';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import useTasks from '../../hooks/tasks/useTasks';
import type { TaskRequest, TaskResponse } from '../../types/task';

/*
  This page is the main task dashboard where users can create, edit, complete, and delete tasks.
  It composes the table and modals while reading all business actions from the `useTasks` hook.
*/
const { Content } = Layout;
const { Title, Text } = Typography;

// Main CRUD page:
// 1) show tasks
// 2) open create/edit modal
// 3) open details modal
const TasksPage = () => {
  const {
    tasks,
    loading,
    notice,
    modalOpen,
    editingTask,
    openCreate,
    closeForm,
    handleEdit,
    handleDelete,
    handleComplete,
    handleSubmit,
    refreshTasks,
  } = useTasks();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);

  const openDetails = (id: number) => {
    setSelectedTaskId(id);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedTaskId(undefined);
  };

  // Convert API response shape into form shape.
  const toTaskRequest = (task: TaskResponse | null): TaskRequest | undefined => {
    if (!task) return undefined;

    return {
      title: task.title ?? '',
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
    };
  };

  // Small footer summary for reporting.
  const taskSummary = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
    const pending = tasks.filter((task) => task.status === 'PENDING').length;

    return {
      total: tasks.length,
      completed,
      pending,
    };
  }, [tasks]);

  return (
    <Layout style={{ height: '100vh', background: '#f5f5f5', overflow: 'hidden' }}>
      <Content style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
        <Card variant="borderless" styles={{ body: { padding: 16 } }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>
                Task Manager
              </Title>
              <Text type="secondary">Project Demo</Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/tasks/deleted">
                <Button size="large">View Deleted Tasks</Button>
              </Link>
              <Button type="primary" size="large" onClick={openCreate}>
                Create Task
              </Button>
            </div>

            {notice && <Alert type="info" showIcon icon={<InfoCircleOutlined />} message={notice} />}

            <TaskTable
              tasks={tasks}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onView={openDetails}
            />

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
                Total tasks: <Text strong>{taskSummary.total}</Text>
              </Text>
              <Text type="secondary">
                Completed: <Text strong>{taskSummary.completed}</Text>
              </Text>
              <Text type="secondary">
                Pending: <Text strong>{taskSummary.pending}</Text>
              </Text>
            </div>
          </Space>
        </Card>

        <TaskFormModal
          open={modalOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          initialValues={toTaskRequest(editingTask)}
        />

        <TaskDetailsModal
          open={detailsOpen}
          taskId={selectedTaskId}
          onClose={closeDetails}
          onDeleted={() => {
            void refreshTasks();
          }}
          onUpdated={() => {
            void refreshTasks();
          }}
        />
      </Content>
    </Layout>
  );
};

export default TasksPage;
