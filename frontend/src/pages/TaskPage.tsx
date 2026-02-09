import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import TaskTable from '../components/TaskTable';
import TaskForm from '../components/TaskForm';
import { TaskRequest, TaskResponse } from '../types/task';
import { getAllTasks, createTask, deleteTask, updateTask } from '../services/taskService';

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);



  const handleEdit = (task: TaskResponse) => {
  setEditingTask(task);
  setModalOpen(true);
};


  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (values: TaskRequest) => {
  try {
    if (editingTask) {
      await updateTask(editingTask.id, values);
      message.success('Task updated successfully');
    } else {
      await createTask(values);
      message.success('Task created successfully');
    }

    setModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  } catch (err: any) {
    message.error(err.message || 'Operation failed');
  }
};

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      message.success('Task deleted successfully');
      fetchTasks();
    } catch (err: any) {
      message.error(err.message || 'Failed to delete task');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Task Manager</h1>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setModalOpen(true)}>
        Create Task
      </Button>
      <TaskTable
  tasks={tasks}
  loading={loading}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
      <TaskForm
  open={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setEditingTask(null);
  }}
  onSubmit={handleSubmit}
  initialValues={editingTask ? (editingTask as TaskRequest) : undefined}
/>
    </div>
  );
};

export default TaskPage;
