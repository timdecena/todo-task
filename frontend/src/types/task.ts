/*
  This file defines shared TypeScript types for task data going to and from the backend.
  Using these types helps catch mistakes early and keeps components consistent.
*/
export type TaskPriority = 'HIGH' | 'MODERATE' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'PENDING' | 'COMPLETED';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

// Data we send to the backend when creating/updating a task.
export type TaskRequest = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  boardOrder?: number;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceEndAt?: string;
  recurrenceGroupId?: string;
  deadline?: string; // ISO local date-time string
};

// Data we receive from the backend.
export type TaskResponse = {
  id: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  boardOrder?: number;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceEndAt?: string;
  recurrenceGroupId?: string;
  deadline?: string;
  dateCreated?: string;
};

/**
 * Payload for updating one task Kanban status.
 */
export type TaskStatusUpdateRequest = {
  status: TaskStatus;
  boardOrder?: number;
};

/**
 * Payload for reordering one Kanban status column.
 */
export type TaskBoardReorderRequest = {
  status: TaskStatus;
  orderedTaskIds: number[];
};
