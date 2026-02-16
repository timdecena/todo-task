import { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Input, Layout, Row, Segmented, Select, Space, Tag, Typography, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { TaskResponse, TaskStatus, TaskStatusUpdateRequest } from '../../types/task';
import useTasks from '../../hooks/tasks/useTasks';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import { patchTaskStatus, reorderBoardColumn } from '../../services/tasks/taskApi';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const { Content } = Layout;
const { Title, Text } = Typography;

type KanbanStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type KanbanSortField = 'boardOrder' | 'deadline' | 'priority' | 'status' | 'dateCreated' | 'title';
type KanbanSortDir = 'asc' | 'desc';

type BoardColumns = Record<KanbanStatus, TaskResponse[]>;

const columnMeta: Array<{ status: KanbanStatus; title: string }> = [
  { status: 'TODO', title: 'Todo' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'DONE', title: 'Done' },
];

const priorityRank: Record<string, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
};

/**
 * Normalizes old statuses for board display.
 *
 * @param status raw status from API
 * @returns current Kanban status value
 */
const toKanbanStatus = (status?: TaskStatus): KanbanStatus => {
  if (status === 'COMPLETED') return 'DONE';
  if (status === 'PENDING') return 'TODO';
  if (status === 'IN_PROGRESS' || status === 'DONE' || status === 'TODO') return status;
  return 'TODO';
};

/**
 * Sorts tasks for stable board rendering.
 *
 * @param a first task
 * @param b second task
 * @returns sort order value
 */
const sortByBoardOrder = (a: TaskResponse, b: TaskResponse): number => {
  const aOrder = a.boardOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.boardOrder ?? Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.id - b.id;
};

const compareByField = (a: TaskResponse, b: TaskResponse, field: KanbanSortField): number => {
  if (field === 'boardOrder') {
    return sortByBoardOrder(a, b);
  }
  if (field === 'deadline') {
    const aDeadline = a.deadline ? dayjs(a.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
    const bDeadline = b.deadline ? dayjs(b.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
    if (aDeadline !== bDeadline) return aDeadline - bDeadline;
    return sortByBoardOrder(a, b);
  }
  if (field === 'priority') {
    const aPriority = priorityRank[a.priority ?? ''] ?? Number.MAX_SAFE_INTEGER;
    const bPriority = priorityRank[b.priority ?? ''] ?? Number.MAX_SAFE_INTEGER;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return sortByBoardOrder(a, b);
  }
  if (field === 'dateCreated') {
    const aCreated = a.dateCreated ? dayjs(a.dateCreated).valueOf() : Number.MAX_SAFE_INTEGER;
    const bCreated = b.dateCreated ? dayjs(b.dateCreated).valueOf() : Number.MAX_SAFE_INTEGER;
    if (aCreated !== bCreated) return aCreated - bCreated;
    return sortByBoardOrder(a, b);
  }
  if (field === 'status') {
    const rank = (value?: TaskStatus): number => {
      const normalized = toKanbanStatus(value);
      if (normalized === 'TODO') return 1;
      if (normalized === 'IN_PROGRESS') return 2;
      return 3;
    };
    const byStatus = rank(a.status) - rank(b.status);
    return byStatus !== 0 ? byStatus : sortByBoardOrder(a, b);
  }

  const byTitle = (a.title ?? '').localeCompare(b.title ?? '');
  return byTitle !== 0 ? byTitle : sortByBoardOrder(a, b);
};

/**
 * Renders a simple Kanban board backed by task statuses.
 */
const KanbanPage = () => {
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
    handleSubmit,
    refreshTasks,
  } = useTasks();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragSourceStatus, setDragSourceStatus] = useState<KanbanStatus | null>(null);
  const [moving, setMoving] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 220);
  const [statusFilter, setStatusFilter] = useState<'ALL' | KanbanStatus>('ALL');
  const [deadlineQuickFilter, setDeadlineQuickFilter] = useState<'ALL' | '1' | '7' | '14'>('ALL');
  const [sortBy, setSortBy] = useState<KanbanSortField>('boardOrder');
  const [sortDir, setSortDir] = useState<KanbanSortDir>('asc');

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const nowTs = dayjs().valueOf();
    const quickFilterEndTs =
      deadlineQuickFilter === 'ALL'
        ? null
        : dayjs().add(Number(deadlineQuickFilter), 'day').endOf('day').valueOf();

    return tasks.filter((task) => {
      const normalizedStatus = toKanbanStatus(task.status);
      const searchBlob = [task.title, task.description, task.priority, task.status].filter(Boolean).join(' ').toLowerCase();
      const deadlineTs = task.deadline ? dayjs(task.deadline).valueOf() : null;

      if (keyword && !searchBlob.includes(keyword)) return false;
      if (statusFilter !== 'ALL' && normalizedStatus !== statusFilter) return false;

      if (deadlineQuickFilter === 'ALL') return true;
      if (deadlineTs === null || quickFilterEndTs === null) return false;
      return deadlineTs >= nowTs && deadlineTs <= quickFilterEndTs;
    });
  }, [tasks, search, statusFilter, deadlineQuickFilter]);

  const boardColumns = useMemo<BoardColumns>(() => {
    const grouped: BoardColumns = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    filteredTasks.forEach((task) => {
      grouped[toKanbanStatus(task.status)].push(task);
    });

    const sortWithDirection = (a: TaskResponse, b: TaskResponse): number => {
      const compared = compareByField(a, b, sortBy);
      return sortDir === 'asc' ? compared : -compared;
    };

    grouped.TODO.sort(sortWithDirection);
    grouped.IN_PROGRESS.sort(sortWithDirection);
    grouped.DONE.sort(sortWithDirection);

    return grouped;
  }, [filteredTasks, sortBy, sortDir]);

  const openDetails = (id: number) => {
    setSelectedTaskId(id);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedTaskId(undefined);
  };

  /**
   * Moves a card to target column and persists board order.
   *
   * @param targetStatus target column
   * @returns promise that resolves when move is processed
   */
  const moveTaskToColumn = async (targetStatus: KanbanStatus): Promise<void> => {
    if (!draggedTaskId || moving) return;

    const sourceStatus = dragSourceStatus ?? targetStatus;
    const sourceList = [...boardColumns[sourceStatus]];
    const targetList = sourceStatus === targetStatus ? sourceList : [...boardColumns[targetStatus]];

    const sourceFiltered = sourceList.filter((task) => task.id !== draggedTaskId);
    const draggedTask = tasks.find((task) => task.id === draggedTaskId);
    if (!draggedTask) return;
    if (toKanbanStatus(draggedTask.status) === 'DONE') {
      setDraggedTaskId(null);
      setDragSourceStatus(null);
      return;
    }

    const movedTask: TaskResponse = { ...draggedTask, status: targetStatus };
    const nextTargetList =
      sourceStatus === targetStatus ? [...sourceFiltered, movedTask] : [...targetList, movedTask];

    const payload: TaskStatusUpdateRequest = { status: targetStatus };

    setMoving(true);
    try {
      await patchTaskStatus(draggedTaskId, payload);

      await reorderBoardColumn({
        status: targetStatus,
        orderedTaskIds: nextTargetList.map((task) => task.id),
      });

      if (sourceStatus !== targetStatus && sourceFiltered.length > 0) {
        await reorderBoardColumn({
          status: sourceStatus,
          orderedTaskIds: sourceFiltered.map((task) => task.id),
        });
      }

      await refreshTasks();
      message.success('Task moved');
    } catch (error: unknown) {
      const msg =
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
          ? (error as { message?: string }).message
          : 'Failed to move task';
      message.error(msg);
    } finally {
      setMoving(false);
      setDraggedTaskId(null);
      setDragSourceStatus(null);
    }
  };

  return (
    <Layout style={{ height: '100vh', background: '#f5f5f5', overflow: 'hidden' }}>
      <Content style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Task Kanban
            </Title>
            <Text type="secondary">Drag cards between columns</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Segmented
              size="large"
              options={[
                { label: 'Table', value: 'table' },
                { label: 'Kanban', value: 'kanban' },
                { label: 'Deleted', value: 'deleted' },
              ]}
              value="kanban"
              onChange={(value) => {
                if (value === 'table') {
                  navigate('/tasks');
                } else if (value === 'deleted') {
                  navigate('/tasks/deleted');
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <Input.Search
              placeholder="Search title, description, status, priority"
              allowClear
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={(value) => setSearchInput(value)}
              style={{ width: 320 }}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 170 }}
              options={[
                { value: 'ALL', label: 'Status' },
                { value: 'TODO', label: 'Todo' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'DONE', label: 'Done' },
              ]}
            />
            <Select
              value={deadlineQuickFilter}
              onChange={(value) => setDeadlineQuickFilter(value)}
              style={{ width: 180 }}
              options={[
                { value: 'ALL', label: 'Deadlines' },
                { value: '1', label: 'Within 1 day' },
                { value: '7', label: 'Within 7 days' },
                { value: '14', label: 'Within 14 days' },
              ]}
            />
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              style={{ width: 170 }}
              options={[
                { value: 'boardOrder', label: 'Manual order' },
                { value: 'deadline', label: 'Deadline' },
                { value: 'priority', label: 'Priority' },
                { value: 'status', label: 'Status' },
                { value: 'dateCreated', label: 'Date created' },
                { value: 'title', label: 'Title' },
              ]}
            />
            <Select
              value={sortDir}
              onChange={(value) => setSortDir(value)}
              style={{ width: 120 }}
              options={[
                { value: 'asc', label: 'Asc' },
                { value: 'desc', label: 'Desc' },
              ]}
            />
            <Button type="primary" size="large" onClick={openCreate}>
              Create Task
            </Button>
          </div>

          {notice && <Alert type="info" showIcon icon={<InfoCircleOutlined />} message={notice} />}

          <Row gutter={[16, 16]} style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
            {columnMeta.map((column) => {
              const items = boardColumns[column.status];
              return (
                <Col xs={24} md={8} key={column.status}>
                  <Card
                    title={
                      <Space>
                        <span>{column.title}</span>
                        <Tag style={{ marginInlineEnd: 0 }}>{items.length}</Tag>
                      </Space>
                    }
                    styles={{ body: { maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', padding: 12 } }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      void moveTaskToColumn(column.status);
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {items.map((task) => (
                        <Card
                          key={task.id}
                          size="small"
                          draggable={!moving && toKanbanStatus(task.status) !== 'DONE'}
                          onDragStart={() => {
                            if (toKanbanStatus(task.status) === 'DONE') return;
                            setDraggedTaskId(task.id);
                            setDragSourceStatus(toKanbanStatus(task.status));
                          }}
                          onClick={() => openDetails(task.id)}
                          style={{
                            cursor: moving ? 'not-allowed' : 'grab',
                            border:
                              draggedTaskId === task.id
                                ? '1px solid #1677ff'
                                : '1px solid #f0f0f0',
                          }}
                        >
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <Text strong ellipsis={{ tooltip: task.title }}>
                              {task.title}
                            </Text>
                            {task.priority && (
                              <Tag style={{ width: 'fit-content', marginInlineEnd: 0 }}>{task.priority}</Tag>
                            )}
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {task.deadline ? dayjs(task.deadline).format('MMM DD, YYYY hh:mm A') : 'No deadline'}
                            </Text>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                              <Button
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleEdit(task);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Space>

        <TaskFormModal
          open={modalOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          initialValues={
            editingTask
              ? {
                  title: editingTask.title ?? '',
                  description: editingTask.description ?? '',
                  priority: editingTask.priority,
                  status: toKanbanStatus(editingTask.status),
                  deadline: editingTask.deadline,
                  boardOrder: editingTask.boardOrder,
                  recurrenceType: editingTask.recurrenceType,
                  recurrenceInterval: editingTask.recurrenceInterval,
                  recurrenceEndAt: editingTask.recurrenceEndAt,
                  recurrenceGroupId: editingTask.recurrenceGroupId,
                }
              : undefined
          }
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

export default KanbanPage;
