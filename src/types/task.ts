export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  owner?: string;
  ownerEmail?: string;
  dueDate?: string;
  aiHint?: string;
  labels?: string;
  project?: string;
  sprint?: string;
  estimate?: string;
  blocked?: boolean;
  blockerReason?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type TaskDraft = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  parentId?: string;
  owner?: string;
  ownerEmail?: string;
  dueDate?: string;
  aiHint?: string;
  labels?: string;
  project?: string;
  sprint?: string;
  estimate?: string;
  blocked?: boolean;
  blockerReason?: string;
  createdBy?: string;
  updatedBy?: string;
};
