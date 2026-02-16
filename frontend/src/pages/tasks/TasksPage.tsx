import { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Layout, Row, Segmented, Space, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import TaskTable from '../../components/tasks/TaskTable';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import TaskCalendarWidget from '../../components/tasks/TaskCalendarWidget';
import TodayDeadlinesWidget from '../../components/tasks/TodayDeadlinesWidget';
import TaskHealthWidget from '../../components/tasks/TaskHealthWidget';
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
  const navigate = useNavigate();
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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const isRightPanelExpanded = isCalendarExpanded;

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
      recurrenceType: task.recurrenceType,
      recurrenceInterval: task.recurrenceInterval,
      recurrenceEndAt: task.recurrenceEndAt,
      recurrenceGroupId: task.recurrenceGroupId,
      deadline: task.deadline,
    };
  };

  // Small footer summary for reporting.
  const taskSummary = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'DONE' || task.status === 'COMPLETED').length;
    const pending = tasks.length - completed;

    return {
      total: tasks.length,
      completed,
      pending,
    };
  }, [tasks]);

  return (
    <Layout style={{ height: '100vh', background: '#f5f5f5', overflow: 'hidden' }}>
      <Content style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
        <Row gutter={[16, 16]} style={{ height: '100%' }} align="stretch">
          <Col
            xs={24}
            xl={isRightPanelExpanded ? 16 : 19}
            style={{
              transition: 'flex-basis 300ms cubic-bezier(0.22, 1, 0.36, 1), max-width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <Card variant="borderless" style={{ height: '100%' }} styles={{ body: { padding: 16, height: '100%' } }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={2} style={{ margin: 0 }}>
                    Sug Done
                  </Title>
                  <Text type="secondary">Project Demo</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Segmented
                    size="large"
                    options={[
                      { label: 'Table', value: 'table' },
                      { label: 'Kanban', value: 'kanban' },
                      { label: 'Deleted', value: 'deleted' },
                    ]}
                    value="table"
                    onChange={(value) => {
                      if (value === 'kanban') {
                        navigate('/tasks/kanban');
                      } else if (value === 'deleted') {
                        navigate('/tasks/deleted');
                      }
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
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
          </Col>

          <Col
            xs={24}
            xl={isRightPanelExpanded ? 8 : 5}
            style={{
              transition: 'flex-basis 300ms cubic-bezier(0.22, 1, 0.36, 1), max-width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              maxHeight: '100%',
              overflowY: 'hidden',
              paddingRight: 2,
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <TodayDeadlinesWidget
                tasks={tasks}
                loading={loading}
              />
              <TaskCalendarWidget
                tasks={tasks}
                loading={loading}
                onExpandChange={setIsCalendarExpanded}
                onTasksChanged={refreshTasks}
                onDeleteTask={handleDelete}
              />
              <TaskHealthWidget
                tasks={tasks}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>

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
          onDeleteTask={handleDelete}
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
