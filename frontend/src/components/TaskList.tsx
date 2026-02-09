import { Table, Button, Modal } from 'antd';
import { TaskResponse, TaskRequest } from '../types/task';
import { updateTask, deleteTask, markTaskAsCompleted } from '../services/taskService';
import TaskForm from './TaskForm';
import { useState } from 'react';

const AllTasks = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEditClick = (task: TaskResponse) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleUpdate = async (values: TaskRequest) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, values);
    setShowForm(false);
    setEditingTask(null);
    // refresh list
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TaskResponse) => (
        <>
          <Button onClick={() => handleEditClick(record)} type="primary" style={{ marginRight: 8 }}>
            Update
          </Button>
          <Button danger onClick={() => deleteTask(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={tasks} rowKey="id" />
      {showForm && editingTask && (
        <TaskForm
  open={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleUpdate}
  initialValues={{
    title: editingTask.title,
    description: editingTask.description,
    priority: editingTask.priority as 'HIGH' | 'MODERATE' | 'LOW' | undefined,
    status: editingTask.status as 'ACTIVE' | 'COMPLETED' | undefined,
    deadline: editingTask.deadline,
  }}
/>
      )}
    </>
  );
};

export default AllTasks;
