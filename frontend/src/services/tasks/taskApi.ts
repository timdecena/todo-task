import httpClient from '../http/httpClient';
import {
  TaskRequest,
  TaskResponse,
  TaskStatusUpdateRequest,
  TaskBoardReorderRequest,
} from '../../types/task';

/*
  This file contains all task-related API calls used by the frontend.
  Each function maps a frontend action (create, read, update, delete, complete) to a backend endpoint.
*/
const TASKS_URL = '/api/tasks';
export type TaskSortField = 'deadline' | 'priority' | 'status' | 'dateCreated';
export type SortDir = 'asc' | 'desc';

export type GetTasksParams = {
  page: number; // 0-based for Spring
  size: number;
  sortBy: TaskSortField;
  sortDir: SortDir;
};

export type GetDeletedTasksParams = {
  page: number; // 0-based for Spring
  size: number;
};

// Read all active tasks (paged from backend).
export async function getAllTasks(params: GetTasksParams): Promise<TaskResponse[]> {
  const response = await httpClient.get<TaskResponse[]>(TASKS_URL, { params });
  return response.data;
}

// Read one task by id.
export const getTaskById = async (id: number): Promise<TaskResponse> => {
  const response = await httpClient.get<TaskResponse>(`${TASKS_URL}/${id}`);
  return response.data;
};

// Create task.
export const createTask = async (task: TaskRequest): Promise<TaskResponse> => {
  const response = await httpClient.post<TaskResponse>(TASKS_URL, task);
  return response.data;
};

// Update task.
export const updateTask = async (id: number, task: TaskRequest): Promise<TaskResponse> => {
  const response = await httpClient.put<TaskResponse>(`${TASKS_URL}/${id}`, task);
  return response.data;
};

// Soft delete task.
export const deleteTask = async (id: number): Promise<void> => {
  await httpClient.delete(`${TASKS_URL}/${id}`);
};

/**
 * Restores a previously deleted task.
 *
 * @param id task id
 * @returns restored task response
 * @throws AxiosError when backend returns an error
 */
export const restoreTask = async (id: number): Promise<TaskResponse> => {
  const response = await httpClient.post<TaskResponse>(`${TASKS_URL}/${id}/restore`);
  return response.data;
};

// Mark task complete.
export const markTaskAsCompleted = async (id: number): Promise<TaskResponse> => {
  const response = await httpClient.patch<TaskResponse>(`${TASKS_URL}/${id}/complete`);
  return response.data;
};

/**
 * Updates one task status (Kanban move).
 *
 * @param id task id
 * @param payload target status and optional board order
 * @returns updated task response
 * @throws AxiosError when backend returns an error
 */
export const patchTaskStatus = async (id: number, payload: TaskStatusUpdateRequest): Promise<TaskResponse> => {
  const response = await httpClient.patch<TaskResponse>(`${TASKS_URL}/${id}/status`, payload);
  return response.data;
};

/**
 * Reorders tasks inside one Kanban column.
 *
 * @param payload status and ordered task IDs
 * @returns API success payload
 * @throws AxiosError when payload is invalid
 */
export const reorderBoardColumn = async (
  payload: TaskBoardReorderRequest,
): Promise<{ status: number; message: string }> => {
  const response = await httpClient.patch<{ status: number; message: string }>(`${TASKS_URL}/board/reorder`, payload);
  return response.data;
};

// Read all soft-deleted tasks (paged from backend).
export const getDeletedTasks = async (params: GetDeletedTasksParams): Promise<TaskResponse[]> => {
  const response = await httpClient.get<TaskResponse[]>(`${TASKS_URL}/deleted`, { params });
  return response.data;
};
