/*
  This file defines shared TypeScript types for task data going to and from the backend.
  Using these types helps catch mistakes early and keeps components consistent.
*/
export type TaskPriority = 'HIGH' | 'MODERATE' | 'LOW';
export type TaskStatus = 'PENDING' | 'COMPLETED';

// Data we send to the backend when creating/updating a task.
export type TaskRequest = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string; // ISO local date-time string
};

// Data we receive from the backend.
export type TaskResponse = {
  id: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  dateCreated?: string;
};
