"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { columns, priorities } from "@/lib/tasks";
import type { Task, TaskDraft, TaskPriority, TaskStatus } from "@/types/task";

type TaskModalProps = {
  task?: Task | null;
  tasks: Task[];
  onClose: () => void;
  onSave: (task: TaskDraft | Task) => Promise<void> | void;
  isSaving?: boolean;
};

const emptyTask: TaskDraft = {
  title: "",
  description: "",
  owner: "",
  priority: "Medium",
  status: "TODO",
  parentId: "",
  dueDate: "This week",
  aiHint: "",
  labels: "",
  project: "",
  sprint: "",
  estimate: "",
  blocked: false,
  blockerReason: "",
  createdBy: "",
  updatedBy: "",
};

export function TaskModal({ task, tasks, onClose, onSave, isSaving = false }: TaskModalProps) {
  const [form, setForm] = useState<TaskDraft>(task ?? emptyTask);
  const blockedParentIds = task ? getDescendantIds(task.id, tasks) : new Set<string>();
  const parentOptions = tasks.filter((candidate) => candidate.id !== task?.id && !blockedParentIds.has(candidate.id));

  function updateField<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      parentId: form.parentId || "",
      owner: form.owner?.trim() || "Unassigned",
      dueDate: form.dueDate?.trim() || "",
      aiHint: form.aiHint?.trim() || "Ask AI to turn this into the next best action.",
      labels: form.labels?.trim() || "",
      project: form.project?.trim() || "",
      sprint: form.sprint?.trim() || "",
      estimate: form.estimate?.trim() || "",
      blocked: Boolean(form.blocked),
      blockerReason: form.blockerReason?.trim() || "",
      createdBy: form.createdBy?.trim() || "",
      updatedBy: form.updatedBy?.trim() || "",
    };

    if (!payload.title || !payload.description) {
      return;
    }

    await onSave(task ? { ...task, ...payload } : payload);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 sm:place-items-center sm:p-5">
      <form onSubmit={handleSubmit} className="w-full rounded-t-lg border border-white/10 bg-slate-950 p-5 shadow-2xl sm:max-w-xl sm:rounded-lg">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-200">{task ? "Edit task" : "Create task"}</p>
            <h2 className="text-2xl font-semibold">{task ? "Update board card" : "Add sprint work"}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Title
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
              placeholder="Ship onboarding flow"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Project
              <input
                value={form.project || ""}
                onChange={(event) => updateField("project", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Khaban MVP"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Sprint
              <input
                value={form.sprint || ""}
                onChange={(event) => updateField("sprint", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Sprint 1"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Labels
              <input
                value={form.labels || ""}
                onChange={(event) => updateField("labels", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="frontend, api"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Estimate
              <input
                value={form.estimate || ""}
                onChange={(event) => updateField("estimate", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="3 pts"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(form.blocked)}
                onChange={(event) => updateField("blocked", event.target.checked)}
                className="size-4 accent-cyan-300"
              />
              Blocked
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Blocker reason
              <input
                value={form.blockerReason || ""}
                onChange={(event) => updateField("blockerReason", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Waiting on API access"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="min-h-24 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
              placeholder="What needs to happen?"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Owner
              <input
                value={form.owner}
                onChange={(event) => updateField("owner", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Team member"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Due
              <input
                value={form.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
                placeholder="Friday"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Priority
              <select
                value={form.priority}
                onChange={(event) => updateField("priority", event.target.value as TaskPriority)}
                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-300">
              Status
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as TaskStatus)}
                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Parent ticket
            <select
              value={form.parentId || ""}
              onChange={(event) => updateField("parentId", event.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
            >
              <option value="">No parent</option>
              {parentOptions.map((parentTask) => (
                <option key={parentTask.id} value={parentTask.id}>
                  {parentTask.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-300">
            AI hint
            <input
              value={form.aiHint}
              onChange={(event) => updateField("aiHint", event.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
              placeholder="Ask AI to..."
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70">
            {isSaving ? "Saving..." : "Save task"}
          </button>
        </div>
      </form>
    </div>
  );
}

function getDescendantIds(taskId: string, tasks: Task[]) {
  const descendants = new Set<string>();
  const queue = tasks.filter((task) => task.parentId === taskId).map((task) => task.id);

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!currentId || descendants.has(currentId)) {
      continue;
    }

    descendants.add(currentId);
    queue.push(...tasks.filter((task) => task.parentId === currentId).map((task) => task.id));
  }

  return descendants;
}
