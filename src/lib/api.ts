import type { Task, TaskDraft } from "@/types/task";

const API_URL =
  process.env.NEXT_PUBLIC_KHABAN_API_URL ||
  "https://script.google.com/macros/s/AKfycbyIpZMeCpJOXR9oo1k-kdVCCN920-Rf_DM4_T_T-ctO7ljeeLEzTk-E8lgK-MhFOCmM/exec";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

type BackendTask = Task;

export async function fetchTasks() {
  const response = await fetch(API_URL, { cache: "no-store" });
  return readResponse<BackendTask[]>(response);
}

export async function createTask(task: TaskDraft) {
  const response = await postJson<BackendTask>({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    parentId: task.parentId || "",
    owner: task.owner || "",
    dueDate: task.dueDate || "",
    aiHint: task.aiHint || "",
    labels: task.labels || "",
    project: task.project || "",
    sprint: task.sprint || "",
    estimate: task.estimate || "",
    blocked: Boolean(task.blocked),
    blockerReason: task.blockerReason || "",
    createdBy: task.createdBy || "",
    updatedBy: task.updatedBy || "",
  });
  return response;
}

export async function updateTask(id: string, task: Partial<TaskDraft>) {
  const response = await postJson<BackendTask>({
    _method: "PUT",
    id,
    ...task,
  });
  return response;
}

export async function deleteTask(id: string) {
  const response = await postJson<{ id: string }>({
    _method: "DELETE",
    id,
  });
  return response;
}

export function normalizeTask(task: BackendTask | Task): Task {
  return {
    ...task,
    parentId: task.parentId || undefined,
    owner: task.owner || "Workspace",
    dueDate: task.dueDate || formatRelativeDate(task.updatedAt || task.createdAt),
    aiHint: task.aiHint || getAiHint(task.status, task.priority),
    blocked: normalizeBoolean(task.blocked),
  };
}

async function postJson<T>(payload: Record<string, unknown>) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return readResponse<T>(response);
}

async function readResponse<T>(response: Response) {
  const body = (await response.json()) as ApiResponse<T>;

  if (!body.ok || !body.data) {
    throw new Error(body.error || `Request failed with status ${body.statusCode || response.status}`);
  }

  return body.data;
}

function formatRelativeDate(value: string) {
  if (!value) {
    return "Synced";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getAiHint(status: Task["status"], priority: Task["priority"]) {
  if (status === "DONE") {
    return "Ask AI to summarize the outcome and capture reusable notes.";
  }

  if (priority === "Urgent" || priority === "High") {
    return "Ask AI to identify blockers and propose the next two actions.";
  }

  return "Ask AI to clarify scope and estimate the smallest useful next step.";
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  return String(value || "").toLowerCase() === "true";
}
