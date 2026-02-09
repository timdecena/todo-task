export type TaskRequest = {
  title: string;
  description?: string;
  priority?: "HIGH" | "MODERATE" | "LOW";
  status?: "ACTIVE" | "COMPLETED"; // <-- match backend
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
