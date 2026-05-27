import type { Task, TaskPriority, TaskStatus } from "@/types/task";

export const columns: Array<{ id: TaskStatus; label: string; accent: string }> = [
  { id: "TODO", label: "Todo", accent: "bg-sky-400" },
  { id: "IN_PROGRESS", label: "In progress", accent: "bg-amber-300" },
  { id: "DONE", label: "Done", accent: "bg-emerald-300" },
];

export const priorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

export const priorityStyles: Record<TaskPriority, string> = {
  Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Medium: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  High: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  Urgent: "border-rose-400/30 bg-rose-400/10 text-rose-100",
};

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Map onboarding prompts",
    description: "Create AI prompt paths for founders, PMs, and engineers.",
    owner: "Subho",
    priority: "High",
    status: "TODO",
    parentId: "",
    createdAt: "2026-05-27T00:00:00.000Z",
    updatedAt: "2026-05-27T00:00:00.000Z",
    dueDate: "Today",
    aiHint: "Ask AI to cluster setup steps by role.",
  },
  {
    id: "task-2",
    title: "Ship board interactions",
    description: "Drag tasks across stages and keep actions visible on mobile.",
    owner: "Nia",
    priority: "Urgent",
    status: "IN_PROGRESS",
    parentId: "",
    createdAt: "2026-05-27T00:00:00.000Z",
    updatedAt: "2026-05-27T00:00:00.000Z",
    dueDate: "Tomorrow",
    aiHint: "Generate edge cases before demo.",
  },
  {
    id: "task-3",
    title: "Design investor snapshot",
    description: "Summarize momentum, blockers, and weekly delivery health.",
    owner: "Ari",
    priority: "Medium",
    status: "IN_PROGRESS",
    parentId: "task-2",
    createdAt: "2026-05-27T00:00:00.000Z",
    updatedAt: "2026-05-27T00:00:00.000Z",
    dueDate: "Fri",
    aiHint: "Draft a one-minute board update.",
  },
  {
    id: "task-4",
    title: "Review launch checklist",
    description: "Confirm empty states, keyboard flow, and deletion behavior.",
    owner: "Mika",
    priority: "Low",
    status: "DONE",
    parentId: "",
    createdAt: "2026-05-27T00:00:00.000Z",
    updatedAt: "2026-05-27T00:00:00.000Z",
    dueDate: "Done",
    aiHint: "Turn checklist into release notes.",
  },
];
