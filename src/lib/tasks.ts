import type { TaskPriority, TaskStatus } from "@/types/task";

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
