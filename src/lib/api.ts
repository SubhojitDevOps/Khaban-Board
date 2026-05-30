import type { Task, TaskDraft } from "@/types/task";
import { AUTH_STORAGE_KEY, type AuthUser, type UserRole } from "@/components/auth/AuthProvider";

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
  const response = await fetch(`${API_URL}?sessionToken=${encodeURIComponent(getSessionToken())}`, { cache: "no-store" });
  return readResponse<BackendTask[]>(response);
}

export async function createTask(task: TaskDraft) {
  const response = await postJson<BackendTask>({
    sessionToken: getSessionToken(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    parentId: task.parentId || "",
    owner: task.owner || "",
    ownerEmail: task.ownerEmail || "",
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
    sessionToken: getSessionToken(),
    _method: "PUT",
    id,
    ...task,
  });
  return response;
}

export async function deleteTask(id: string) {
  const response = await postJson<{ id: string }>({
    sessionToken: getSessionToken(),
    _method: "DELETE",
    id,
  });
  return response;
}

export async function signupUser(user: Pick<AuthUser, "name" | "email">, password: string) {
  return postJson<AuthUser & { id: string }>({
    action: "signup",
    name: user.name,
    email: user.email,
    password,
  });
}

export async function loginUser(email: string, password: string) {
  return postJson<AuthUser & { id: string }>({
    action: "login",
    email,
    password,
  });
}

export async function logoutUser() {
  return postJson<{ email: string }>({
    action: "logout",
    sessionToken: getSessionToken(),
  });
}

export async function updateUserRole(email: string, role: UserRole, name?: string) {
  return postJson<Partial<AuthUser> & { id: string }>({
    action: "update-role",
    sessionToken: getSessionToken(),
    email,
    role,
    name,
  });
}

function getSessionToken() {
  if (typeof window === "undefined") {
    return "";
  }

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) {
    return "";
  }

  try {
    return (JSON.parse(storedUser) as AuthUser).sessionToken || "";
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return "";
  }
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
