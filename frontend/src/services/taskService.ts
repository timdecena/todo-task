import axios from 'axios';
import { TaskRequest, TaskResponse } from '../types/task';

const API_URL = 'http://localhost:8080/api/tasks';

/**
 * Get all active tasks
 */
export const getAllTasks = async (): Promise<TaskResponse[]> => {
  const res = await axios.get<TaskResponse[]>(`${API_URL}`);
  return res.data;
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (id: number): Promise<TaskResponse> => {
  const res = await axios.get<TaskResponse>(`${API_URL}/${id}`);
  return res.data;
};

/**
 * Create a new task
 */
export const createTask = async (task: TaskRequest): Promise<TaskResponse> => {
  const res = await axios.post<TaskResponse>(`${API_URL}`, task);
  return res.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (id: number, task: TaskRequest): Promise<TaskResponse> => {
  const res = await axios.put<TaskResponse>(`${API_URL}/${id}`, task);
  return res.data;
};

/**
 * Soft delete a task
 */
export const deleteTask = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

/**
 * Mark a task as completed
 */
export const markTaskAsCompleted = async (id: number): Promise<TaskResponse> => {
  const res = await axios.patch<TaskResponse>(`${API_URL}/${id}/complete`);
  return res.data;
};

/**
 * Get deleted tasks
 */
export const getDeletedTasks = async (): Promise<TaskResponse[]> => {
  const res = await axios.get<TaskResponse[]>(`${API_URL}/deleted`);
  return res.data;
};
