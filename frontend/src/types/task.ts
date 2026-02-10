export type TaskRequest = {
  title: string;
  description?: string;
  priority?: "HIGH" | "MODERATE" | "LOW";
  status?: "PENDING" | "COMPLETED"; // match backend
  deadline?: string;
};

export interface TaskResponse {
    id: number;
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    deadline?: string;
    dateCreated?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
