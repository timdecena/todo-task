import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskTable from '../components/TaskTable';
import { getAllTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { TaskRequest, TaskResponse } from '../types/task';
import { Button } from 'antd';

const AllTasks = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    const data = await getAllTasks();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (values: TaskRequest) => {
    if (editingTask) {
      // Update
      await updateTask(editingTask.id, values);
      setEditingTask(null);
    } else {
      // Create
      await createTask(values);
    }
    setShowForm(false);
    fetchTasks();
  };

  const handleEdit = (task: TaskResponse) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    fetchTasks();
  };

  return (
    <>
      <Button type="primary" onClick={() => { setEditingTask(null); setShowForm(true); }}>
        Create Task
      </Button>

      {showForm && (
        <TaskForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          initialValues={editingTask ? (editingTask as TaskRequest) : undefined}
        />
      )}

      <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} loading={false} />
    </>
  );
};

export default AllTasks;
