import httpClient from '../http/httpClient';
import { TaskRequest, TaskResponse } from '../../types/task';

const API_URL = '/api/tasks';
export type TaskSortField = 'deadline' | 'priority' | 'status' | 'dateCreated';
export type SortDir = 'asc' | 'desc';

export type GetTasksParams = {
  page: number; // 0-based for Spring
  size: number;
  sortBy: TaskSortField;
  sortDir: SortDir;
};

/**
 * Get all active tasks
 */
export async function getAllTasks(params: GetTasksParams): Promise<TaskResponse[]> {
  const res = await httpClient.get<TaskResponse[]>('/api/tasks', { params });
  return res.data;
}

/**
 * Get a single task by ID
 */
export const getTaskById = async (id: number): Promise<TaskResponse> => {
  const res = await httpClient.get<TaskResponse>(`${API_URL}/${id}`);
  return res.data;
};

/**
 * Create a new task
 */
export const createTask = async (task: TaskRequest): Promise<TaskResponse> => {
  const res = await httpClient.post<TaskResponse>(`${API_URL}`, task);
  return res.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (id: number, task: TaskRequest): Promise<TaskResponse> => {
  const res = await httpClient.put<TaskResponse>(`${API_URL}/${id}`, task);
  return res.data;
};

/**
 * Soft delete a task
 */
export const deleteTask = async (id: number): Promise<void> => {
  await httpClient.delete(`${API_URL}/${id}`);
};

/**
 * Mark a task as completed
 */
export const markTaskAsCompleted = async (id: number): Promise<TaskResponse> => {
  const res = await httpClient.patch<TaskResponse>(`${API_URL}/${id}/complete`);
  return res.data;
};

/**
 * Get deleted tasks
 */
export const getDeletedTasks = async (): Promise<TaskResponse[]> => {
  const res = await httpClient.get<TaskResponse[]>(`${API_URL}/deleted`);
  return res.data;
};
