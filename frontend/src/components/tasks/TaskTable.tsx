import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { TaskResponse } from '../../types/task';

interface Props {
  tasks: TaskResponse[];
  loading: boolean;
  onEdit: (task: TaskResponse) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
}

const TaskTable: React.FC<Props> = ({
  tasks,
  loading,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setPage(1);
  }, [search]);

  const columns: ColumnsType<TaskResponse> = useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        sorter: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
        render: (v?: string) => (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{v ?? '-'}</div>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        render: (v?: string) => (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{v ?? '-'}</div>
        ),
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
        sorter: (a, b) => (a.priority ?? '').localeCompare(b.priority ?? ''),
        render: (p?: string) => (p ? <Tag>{p}</Tag> : '-'),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 140,
        filters: [
          { text: 'COMPLETED', value: 'COMPLETED' },
          { text: 'PENDING', value: 'PENDING' },
        ],
        onFilter: (value, record) => (record.status ?? '') === value,
        sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? ''),
        render: (s?: string) => (s ? <Tag>{s}</Tag> : '-'),
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        width: 220,
        sorter: (a, b) =>
          dayjs(a.deadline ?? 0).valueOf() - dayjs(b.deadline ?? 0).valueOf(),
        render: (d?: string) => (d ? dayjs(d).format('MMM DD, YYYY hh:mm A') : '-'),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 220,
        render: (_, task) => (
          <Space>
            <Button onClick={() => onEdit(task)}>Edit</Button>
            <Button danger onClick={() => onDelete(task.id)}>Delete</Button>
            <Button
              type="primary"
              disabled={task.status === 'COMPLETED'}
              onClick={() => onComplete(task.id)}
            >
              Complete
            </Button>
          </Space>
        ),
      },
    ],
    [onEdit, onDelete, onComplete]
  );

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tasks;

    return tasks.filter((task) => {
      const haystack = [
        task.title,
        task.description,
        task.priority,
        task.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [tasks, search]);

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
        scroll={{ x: true }}
        locale={{ emptyText: 'No tasks found.' }}
      />
    </>
  );
};

export default TaskTable;
