import { useCallback } from "react";
import { useDrag } from "react-dnd";
import { CalendarDays, GitBranch, Pencil, Trash2, WandSparkles } from "lucide-react";
import { PriorityBadge } from "@/components/kanban/PriorityBadge";
import { DND_ITEM_TYPES } from "@/lib/dnd";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
  parentTitle?: string;
  childCount: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskCard({ task, parentTitle, childCount, onEdit, onDelete }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_ITEM_TYPES.TASK,
      item: { id: task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [task.id, task.status],
  );

  const setDragRef = useCallback(
    (node: HTMLElement | null) => {
      drag(node);
    },
    [drag],
  );

  return (
    <article
      ref={setDragRef}
      className={`group cursor-grab rounded-lg border border-white/10 bg-slate-950/72 p-4 shadow-lg shadow-black/15 transition duration-200 active:cursor-grabbing ${
        isDragging
          ? "scale-[0.98] opacity-45 ring-2 ring-cyan-300/35"
          : "opacity-100 hover:-translate-y-0.5 hover:border-cyan-300/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-6 text-white">{task.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{task.description}</p>
        </div>
        <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="grid size-8 place-items-center rounded-md border border-white/10 text-slate-300 hover:bg-white/8"
            aria-label={`Edit ${task.title}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="grid size-8 place-items-center rounded-md border border-white/10 text-rose-200 hover:bg-rose-400/10"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
          {task.owner || "Workspace"}
        </span>
        {childCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-xs font-semibold text-violet-100">
            <GitBranch size={13} />
            {childCount} child{childCount === 1 ? "" : "ren"}
          </span>
        ) : null}
        {task.estimate ? (
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
            {task.estimate}
          </span>
        ) : null}
        {task.blocked ? (
          <span className="rounded-md border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-xs font-semibold text-rose-100">
            Blocked
          </span>
        ) : null}
      </div>

      {task.project || task.sprint || task.labels ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          {task.project ? <span className="rounded-md bg-white/[0.04] px-2 py-1">{task.project}</span> : null}
          {task.sprint ? <span className="rounded-md bg-white/[0.04] px-2 py-1">{task.sprint}</span> : null}
          {task.labels
            ? task.labels.split(",").map((label) => label.trim()).filter(Boolean).map((label) => (
                <span key={label} className="rounded-md bg-cyan-300/10 px-2 py-1 text-cyan-100">
                  {label}
                </span>
              ))
            : null}
        </div>
      ) : null}

      {parentTitle ? (
        <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
          <GitBranch size={14} className="shrink-0 text-cyan-200" />
          <span className="truncate">Parent: {parentTitle}</span>
        </div>
      ) : null}

      {task.blocked && task.blockerReason ? (
        <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-xs leading-5 text-rose-100">
          {task.blockerReason}
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-cyan-300/12 bg-cyan-300/8 p-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-100">
          <WandSparkles size={14} />
          AI nudge
        </div>
        <p className="text-xs leading-5 text-slate-300">{task.aiHint || "Ask AI to suggest the next best action."}</p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays size={14} />
        {task.dueDate || "Synced"}
      </div>
    </article>
  );
}
