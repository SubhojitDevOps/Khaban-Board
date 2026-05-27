import { priorityStyles } from "@/lib/tasks";
import type { TaskPriority } from "@/types/task";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
}
