import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Input,
  Layout,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import useDeletedTasks from '../../hooks/tasks/useDeletedTasks';
import useTasks from '../../hooks/tasks/useTasks';
import type { TaskResponse } from '../../types/task';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import TaskCalendarWidget from '../../components/tasks/TaskCalendarWidget';
import TodayDeadlinesWidget from '../../components/tasks/TodayDeadlinesWidget';
import TaskHealthWidget from '../../components/tasks/TaskHealthWidget';

const { Content } = Layout;
const { Title, Text } = Typography;

const getDeadlineColor = (value?: string): string | undefined => {
  if (!value) return undefined;
  const now = dayjs();
  const deadline = dayjs(value);
  const hoursLeft = deadline.diff(now, 'hour', true);

  if (hoursLeft <= 24) return 'red';
  if (hoursLeft <= 24 * 7) return 'orange';
  return undefined;
};

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

type IndexedTask = {
  task: TaskResponse;
  searchBlob: string;
  deadlineTs: number | null;
};

const DeletedTasksPage = () => {
  const navigate = useNavigate();
  const { tasks, loading, notice } = useDeletedTasks();
  const { tasks: activeTasks, loading: activeLoading, refreshTasks, handleDelete } = useTasks();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 220);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deadlineRange, setDeadlineRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [deadlineQuickFilter, setDeadlineQuickFilter] = useState<'ALL' | '1' | '7' | '14'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const isRightPanelExpanded = isCalendarExpanded;

  useEffect(() => {
    setPage(1);
  }, [search, deadlineRange, deadlineQuickFilter, statusFilter]);

  const indexedTasks = useMemo<IndexedTask[]>(() => {
    return tasks.map((task) => ({
      task,
      searchBlob: [task.title, task.description, task.priority, task.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      deadlineTs: task.deadline ? dayjs(task.deadline).valueOf() : null,
    }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const nowTs = dayjs().valueOf();
    const quickFilterEndTs =
      deadlineQuickFilter === 'ALL'
        ? null
        : dayjs().add(Number(deadlineQuickFilter), 'day').endOf('day').valueOf();
    const rangeStartTs =
      deadlineRange && deadlineRange[0] ? deadlineRange[0].startOf('day').valueOf() : null;
    const rangeEndTs =
      deadlineRange && deadlineRange[1] ? deadlineRange[1].endOf('day').valueOf() : null;

    const rows = indexedTasks.filter(({ task, searchBlob, deadlineTs }) => {
      if (keyword && !searchBlob.includes(keyword)) return false;
      if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;

      if (rangeStartTs !== null && rangeEndTs !== null) {
        if (deadlineTs === null) return false;
        if (deadlineTs < rangeStartTs || deadlineTs > rangeEndTs) return false;
      }

      if (deadlineQuickFilter === 'ALL') return true;
      if (deadlineTs === null || quickFilterEndTs === null) return false;
      return deadlineTs >= nowTs && deadlineTs <= quickFilterEndTs;
    });

    return rows
      .map(({ task }) => task)
      .sort((a, b) => {
        const aDeadline = a.deadline ? dayjs(a.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
        const bDeadline = b.deadline ? dayjs(b.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
        return aDeadline - bDeadline;
      });
  }, [search, indexedTasks, deadlineRange, deadlineQuickFilter, statusFilter]);

  const columns: ColumnsType<TaskResponse> = [
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
      ellipsis: true,
      render: (value?: string) => (
        <div title={value} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {truncateText(value, 50)}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (value?: string) => (
        <div title={value} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {truncateText(value, 80)}
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.priority ?? '').localeCompare(b.priority ?? ''),
      render: (value?: string) =>
        value ? (
          <Tag style={{ marginInlineEnd: 0, fontSize: 13, lineHeight: '18px' }}>{value}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      align: 'center',
      render: (value?: string) =>
        value ? (
          <Tag style={{ marginInlineEnd: 0, fontSize: 13, lineHeight: '18px' }}>{value}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      width: 190,
      align: 'center',
      render: (value?: string) => {
        if (!value) return '-';
        return (
          <Tag style={{ marginInlineEnd: 0, fontSize: 13, lineHeight: '18px' }} color={getDeadlineColor(value)}>
            {dayjs(value).format('MMM DD, YYYY hh:mm A')}
          </Tag>
        );
      },
    },
  ];

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
                    Deleted Tasks
                  </Title>
                  <Text type="secondary">Soft-deleted tasks list</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Segmented
                    size="large"
                    options={[
                      { label: 'Table', value: 'table' },
                      { label: 'Kanban', value: 'kanban' },
                      { label: 'Deleted', value: 'deleted' },
                    ]}
                    value="deleted"
                    onChange={(value) => {
                      if (value === 'table') {
                        navigate('/tasks');
                      } else if (value === 'kanban') {
                        navigate('/tasks/kanban');
                      }
                    }}
                  />
                </div>

                {notice && <Alert type="info" showIcon icon={<InfoCircleOutlined />} message={notice} />}

                <Space style={{ marginBottom: 8 }}>
                  <Input.Search
                    placeholder="Search title, description, status, priority"
                    allowClear
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={(value) => setSearchInput(value)}
                    style={{ width: 320 }}
                  />
                  <DatePicker.RangePicker
                    value={deadlineRange}
                    onChange={(value) => setDeadlineRange(value)}
                    allowClear
                    placeholder={['Start deadline', 'End deadline']}
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
                </Space>

                <Table
                  rowKey="id"
                  loading={loading}
                  columns={columns}
                  dataSource={filteredTasks}
                  pagination={{
                    current: page,
                    pageSize,
                    total: filteredTasks.length,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                  }}
                  onChange={(pagination) => {
                    setPage(pagination.current ?? 1);
                    setPageSize(pagination.pageSize ?? 10);
                  }}
                  scroll={{ y: 'calc(100vh - 430px)' }}
                  tableLayout="fixed"
                  size="middle"
                  style={{ fontSize: 15 }}
                  locale={{ emptyText: 'No deleted tasks found.' }}
                />
              </Space>
            </Card>
          </Col>

          <Col
            xs={24}
            xl={isRightPanelExpanded ? 8 : 5}
            style={{
              transition: 'flex-basis 300ms cubic-bezier(0.22, 1, 0.36, 1), max-width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              maxHeight: '100%',
              overflowY: 'auto',
              paddingRight: 2,
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <TodayDeadlinesWidget tasks={activeTasks} loading={activeLoading} />
              <TaskCalendarWidget
                tasks={activeTasks}
                loading={activeLoading}
                onExpandChange={setIsCalendarExpanded}
                onTasksChanged={refreshTasks}
                onDeleteTask={handleDelete}
              />
              <TaskHealthWidget tasks={activeTasks} loading={activeLoading} />
            </Space>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DeletedTasksPage;
