import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { TaskResponse } from '../../types/task';

/*
  This component renders the active task list with table actions and filters.
  Users can search, filter by status/deadline, and trigger view/edit/complete/delete from each row.
*/
type Props = {
  tasks: TaskResponse[];
  loading: boolean;
  onEdit: (task: TaskResponse) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onView: (id: number) => void;
};

const priorityOrder: Record<string, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
};

const getPriorityValue = (priority?: string): number => {
  if (!priority) return Number.MAX_SAFE_INTEGER;
  return priorityOrder[priority] ?? Number.MAX_SAFE_INTEGER;
};

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

// Main table for active tasks.
// It includes search, sort, and page controls.
const TaskTable = ({ tasks, loading, onEdit, onDelete, onComplete, onView }: Props) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deadlineRange, setDeadlineRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [deadlineQuickFilter, setDeadlineQuickFilter] = useState<'ALL' | '1' | '7' | '14'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  // Go back to first page when search text changes.
  useEffect(() => {
    setPage(1);
  }, [search, deadlineRange, deadlineQuickFilter, statusFilter]);

  // Filter rows by free-text search.
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
      render: (value?: string) => <div>{truncateText(value, 40)}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (value?: string) => <div>{truncateText(value, 80)}</div>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 140,
      filters: [
        { text: 'HIGH', value: 'HIGH' },
        { text: 'MODERATE', value: 'MODERATE' },
        { text: 'LOW', value: 'LOW' },
      ],
      onFilter: (value, record) => (record.priority ?? '') === value,
      sorter: (a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority),
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
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_, row) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => onView(row.id)}>
            View
          </Button>
          <Button onClick={() => onEdit(row)}>Edit</Button>
          <Popconfirm
            title="Delete this task?"
            description="Are you sure you want to delete this task?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(row.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button type="primary" disabled={row.status === 'COMPLETED'} onClick={() => onComplete(row.id)}>
            Complete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
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
        locale={{ emptyText: 'No tasks found.' }}
      />
    </>
  );
};

export default TaskTable;
