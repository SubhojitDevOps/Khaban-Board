"use client";

import { useCallback } from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "@/components/kanban/TaskCard";
import { DND_ITEM_TYPES } from "@/lib/dnd";
import type { Task, TaskStatus } from "@/types/task";

type DragTask = {
  id: string;
  status: TaskStatus;
};

type KanbanColumnProps = {
  id: TaskStatus;
  label: string;
  accent: string;
  tasks: Task[];
  allTasks: Task[];
  canEdit: boolean;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function KanbanColumn({ id, label, accent, tasks, allTasks, canEdit, onMoveTask, onEdit, onDelete }: KanbanColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DND_ITEM_TYPES.TASK,
      canDrop: (item: DragTask) => canEdit && item.status !== id,
      drop: (item: DragTask) => {
        onMoveTask(item.id, id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [canEdit, id, onMoveTask],
  );

  const setDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      drop(node);
    },
    [drop],
  );

  const isActive = isOver && canDrop;

  return (
    <div
      ref={setDropRef}
      className={`min-h-[420px] rounded-lg border p-3 transition duration-200 ${
        isActive
          ? "scale-[1.01] border-cyan-300/55 bg-cyan-300/10 shadow-xl shadow-cyan-950/20"
          : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${accent}`} />
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</h2>
        </div>
        <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400">{tasks.length}</span>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            parentTitle={allTasks.find((candidate) => candidate.id === task.parentId)?.title}
            childCount={allTasks.filter((candidate) => candidate.parentId === task.id).length}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 ? (
          <div
            className={`rounded-lg border border-dashed p-8 text-center text-sm transition ${
              isActive ? "border-cyan-300/50 text-cyan-100" : "border-white/12 text-slate-500"
            }`}
          >
            Drop tasks here
          </div>
        ) : null}
      </div>
    </div>
  );
}
