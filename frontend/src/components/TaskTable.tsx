import { Table, Button, Tag } from 'antd';
import dayjs from 'dayjs';
import { TaskResponse } from '../types/task';

interface Props {
  tasks: TaskResponse[];
  onEdit: (task: TaskResponse) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

/**
 * TaskTable Component
 *
 * Summary:
 * Displays task list with enum-safe rendering.
 *
 * @param tasks List of tasks
 * @param onEdit Edit callback
 * @param onDelete Delete callback
 * @param loading Table loading indicator
 *
 * @returns Task table UI
 */
const TaskTable: React.FC<Props> = ({ tasks, onEdit, onDelete, loading }) => {

  /**
   * Returns color based on priority enum.
   */
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return 'red';
      case 'MODERATE':
        return 'orange';
      case 'LOW':
        return 'green';
      default:
        return 'default';
    }
  };

  /**
   * Returns color based on status enum.
   */
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority ?? '-'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status ?? '-'}
        </Tag>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) =>
        deadline
          ? dayjs(deadline).format('MMM DD, YYYY hh:mm A')
          : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TaskResponse) => (
        <>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>

          <Button
            type="link"
            danger
            onClick={() => onDelete(record.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Table
      dataSource={tasks}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default TaskTable;
