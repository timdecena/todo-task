import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Input, Layout, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import useDeletedTasks from '../../hooks/tasks/useDeletedTasks';
import type { TaskResponse } from '../../types/task';

/*
  This page shows tasks that were soft-deleted so users can review removed records.
  It supports searching, status/deadline filtering, and table pagination similar to the active list.
*/
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

// Read-only list of soft-deleted tasks.
const DeletedTasksPage = () => {
  const { tasks, loading, notice } = useDeletedTasks();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deadlineRange, setDeadlineRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [deadlineQuickFilter, setDeadlineQuickFilter] = useState<'ALL' | '1' | '7' | '14'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  useEffect(() => {
    setPage(1);
  }, [search, deadlineRange, deadlineQuickFilter, statusFilter]);

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const rows = tasks.filter((task) => {
      if (keyword) {
        const joinedText = [task.title, task.description, task.priority, task.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const textMatch = joinedText.includes(keyword);
        if (!textMatch) return false;
      }

      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }

      if (!deadlineRange || !deadlineRange[0] || !deadlineRange[1]) {
        // continue to quick filter check
      } else {
        if (!task.deadline) return false;

        const deadline = dayjs(task.deadline);
        const start = deadlineRange[0].startOf('day');
        const end = deadlineRange[1].endOf('day');

        const isInsideRange = !deadline.isBefore(start) && !deadline.isAfter(end);
        if (!isInsideRange) return false;
      }

      if (deadlineQuickFilter === 'ALL') return true;
      if (!task.deadline) return false;

      const deadline = dayjs(task.deadline);
      const now = dayjs();
      const end = dayjs().add(Number(deadlineQuickFilter), 'day').endOf('day');

      return !deadline.isBefore(now) && !deadline.isAfter(end);
    });
    return rows.sort((a, b) => {
      const aDeadline = a.deadline ? dayjs(a.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
      const bDeadline = b.deadline ? dayjs(b.deadline).valueOf() : Number.MAX_SAFE_INTEGER;
      return aDeadline - bDeadline;
    });
  }, [search, tasks, deadlineRange, deadlineQuickFilter, statusFilter]);

  const columns: ColumnsType<TaskResponse> = [
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
      render: (value?: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{value ?? '-'}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (value?: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{value ?? '-'}</div>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 140,
      sorter: (a, b) => (a.priority ?? '').localeCompare(b.priority ?? ''),
      render: (value?: string) => (value ? <Tag>{value}</Tag> : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (value?: string) => (value ? <Tag>{value}</Tag> : '-'),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      width: 220,
      render: (value?: string) => {
        if (!value) return '-';
        return <Tag color={getDeadlineColor(value)}>{dayjs(value).format('MMM DD, YYYY hh:mm A')}</Tag>;
      },
    },
  ];

  return (
    <Layout style={{ height: '100vh', background: '#f5f5f5', overflow: 'hidden' }}>
      <Content style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
        <Card variant="borderless" styles={{ body: { padding: 16 } }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>
                Deleted Tasks
              </Title>
              <Text type="secondary">Soft-deleted tasks list</Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/tasks">
                <Button>Back to Active Tasks</Button>
              </Link>
            </div>

            {notice && <Alert type="info" showIcon icon={<InfoCircleOutlined />} message={notice} />}

            <Space style={{ marginBottom: 8 }}>
              <Input.Search
                placeholder="Search title, description, status, priority"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={(value) => setSearch(value)}
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
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'PENDING', label: 'Pending' },
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
              scroll={{ x: true, y: 'calc(100vh - 430px)' }}
              locale={{ emptyText: 'No deleted tasks found.' }}
            />
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default DeletedTasksPage;
