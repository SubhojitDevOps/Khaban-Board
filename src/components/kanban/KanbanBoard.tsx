"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Bell, Bot, Bug, Loader2, Plus, RefreshCw, TrendingUp, Users } from "lucide-react";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskModal } from "@/components/kanban/TaskModal";
import { AppShell } from "@/components/layout/AppShell";
import { columns } from "@/lib/tasks";
import {
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  fetchTasks,
  normalizeTask,
  updateTask as apiUpdateTask,
} from "@/lib/api";
import type { Task, TaskDraft, TaskStatus } from "@/types/task";

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const metrics = useMemo(
    () => [
      { label: "Active tasks", value: tasks.length },
      { label: "In motion", value: tasks.filter((task) => task.status === "IN_PROGRESS").length },
      { label: "Completed", value: tasks.filter((task) => task.status === "DONE").length },
    ],
    [tasks],
  );

  const blockedTasks = useMemo(() => tasks.filter((task) => task.blocked), [tasks]);
  const bugCount = useMemo(
    () => tasks.filter((task) => task.labels?.toLowerCase().includes("bug") || task.title.toLowerCase().includes("bug")).length,
    [tasks],
  );
  const ownerLoad = useMemo(() => {
    const counts = tasks.reduce<Record<string, number>>((owners, task) => {
      const owner = task.owner || "Unassigned";
      owners[owner] = (owners[owner] || 0) + 1;
      return owners;
    }, {});

    return Object.entries(counts).slice(0, 4);
  }, [tasks]);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiTasks = await fetchTasks();
      setTasks(apiTasks.map(normalizeTask));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialTasks() {
      try {
        const apiTasks = await fetchTasks();

        if (isActive) {
          setTasks(apiTasks.map(normalizeTask));
          setErrorMessage(null);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialTasks();

    return () => {
      isActive = false;
    };
  }, []);

  function openCreateModal() {
    setEditingTask(null);
    setIsModalOpen(true);
  }

  const moveTask = useCallback(async (taskId: string, status: TaskStatus) => {
    const previousTasks = tasks;
    const task = tasks.find((currentTask) => currentTask.id === taskId);

    if (!task || task.status === status) {
      return;
    }

    setErrorMessage(null);
    setTasks((current) => current.map((currentTask) => (currentTask.id === taskId ? { ...currentTask, status } : currentTask)));

    try {
      const updatedTask = await apiUpdateTask(taskId, { status });
      setTasks((current) => current.map((currentTask) => (currentTask.id === taskId ? normalizeTask(updatedTask) : currentTask)));
    } catch (error) {
      setTasks(previousTasks);
      setErrorMessage(getErrorMessage(error));
    }
  }, [tasks]);

  async function handleSave(taskPayload: TaskDraft | Task) {
    const previousTasks = tasks;
    const now = new Date().toISOString();

    setIsSaving(true);
    setErrorMessage(null);
    setIsModalOpen(false);
    setEditingTask(null);

    if ("id" in taskPayload) {
      const optimisticTask: Task = { ...taskPayload, updatedAt: now };
      setTasks((current) => current.map((task) => (task.id === optimisticTask.id ? optimisticTask : task)));

      try {
        const updatedTask = await apiUpdateTask(taskPayload.id, taskPayload);
        setTasks((current) => current.map((task) => (task.id === taskPayload.id ? normalizeTask(updatedTask) : task)));
      } catch (error) {
        setTasks(previousTasks);
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsSaving(false);
      }

      return;
    }

    const temporaryId = `temp-${crypto.randomUUID()}`;
    const optimisticTask: Task = {
      ...taskPayload,
      id: temporaryId,
      createdAt: now,
      updatedAt: now,
      owner: taskPayload.owner || "Workspace",
      dueDate: taskPayload.dueDate || "Syncing",
      aiHint: taskPayload.aiHint || "Ask AI to turn this into the next best action.",
    };

    setTasks((current) => [optimisticTask, ...current]);

    try {
      const createdTask = await apiCreateTask(taskPayload);
      setTasks((current) => current.map((task) => (task.id === temporaryId ? normalizeTask(createdTask) : task)));
    } catch (error) {
      setTasks(previousTasks);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    const previousTasks = tasks;
    setErrorMessage(null);
    setTasks((current) => current.filter((task) => task.id !== id));

    try {
      await apiDeleteTask(id);
    } catch (error) {
      setTasks(previousTasks);
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function generateAiSuggestion() {
    setIsAiLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });
      const body = (await response.json()) as { ok: boolean; data?: { suggestion: string }; error?: string };

      if (!body.ok || !body.data) {
        throw new Error(body.error || "AI suggestion failed.");
      }

      setAiSuggestion(body.data.suggestion);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <AppShell onCreateTask={openCreateModal}>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <p className="mb-3 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
              <Bot size={15} />
              AI delivery cockpit
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">Dashboard</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Manage sprint work, prioritize execution, and keep AI assistance close to every task.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 md:w-auto"
              >
                <Plus size={17} />
                Create task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-slate-950 p-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-2xl font-semibold">{metric.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5 flex flex-col gap-3 rounded-lg border border-emerald-300/15 bg-emerald-300/8 p-4 text-emerald-50 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <TrendingUp className="mt-1 shrink-0" size={20} />
            <div>
              <p className="text-sm leading-6">
                Connected to Google Sheets. Changes sync through the Apps Script API with optimistic board updates.
              </p>
              {aiSuggestion ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-emerald-100">{aiSuggestion}</p> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={generateAiSuggestion}
            disabled={isAiLoading || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200/20 px-3 py-2 text-sm font-semibold transition hover:bg-emerald-200/10 disabled:cursor-wait disabled:opacity-60"
          >
            {isAiLoading ? <Loader2 className="animate-spin" size={15} /> : <Bot size={15} />}
            {isAiLoading ? "Thinking..." : "Ask Gemini"}
          </button>
        </section>

          {errorMessage ? (
            <section className="mb-5 flex flex-col gap-3 rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-rose-100 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6">{errorMessage}</p>
              <button
                type="button"
                onClick={loadTasks}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200/20 px-3 py-2 text-sm font-semibold transition hover:bg-rose-200/10"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </section>
          ) : null}

          {!isLoading ? (
            <section className="mb-5 grid gap-4 xl:grid-cols-4">
              <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Bug size={16} className="text-rose-200" />
                  Issue tracking
                </div>
                <p className="text-2xl font-semibold">{bugCount}</p>
                <p className="mt-1 text-sm text-slate-500">Bug-labelled tickets</p>
              </article>

              <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Users size={16} className="text-cyan-200" />
                  Team load
                </div>
                <div className="space-y-2">
                  {ownerLoad.length > 0 ? ownerLoad.map(([owner, count]) => (
                    <div key={owner} className="flex items-center justify-between text-sm">
                      <span className="truncate text-slate-400">{owner}</span>
                      <span className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-300">{count}</span>
                    </div>
                  )) : <p className="text-sm text-slate-500">No assignments yet</p>}
                </div>
              </article>

              <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <ChartIcon />
                  Sprint health
                </div>
                <p className="text-2xl font-semibold">
                  {tasks.length ? Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100) : 0}%
                </p>
                <p className="mt-1 text-sm text-slate-500">Completion rate</p>
              </article>

              <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Bell size={16} className="text-amber-200" />
                  Notifications
                </div>
                <p className="text-2xl font-semibold">{blockedTasks.length}</p>
                <p className="mt-1 text-sm text-slate-500">Blocked-work alerts</p>
              </article>
            </section>
          ) : null}

          {isLoading ? (
            <section className="grid min-h-[420px] place-items-center rounded-lg border border-white/10 bg-white/[0.035] p-8 text-slate-300">
              <div className="flex items-center gap-3 text-sm">
                <Loader2 className="animate-spin text-cyan-200" size={18} />
                Loading tasks from Google Sheets...
              </div>
            </section>
          ) : (
            <section className="grid gap-4 xl:grid-cols-3">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  accent={column.accent}
                  tasks={tasks.filter((task) => task.status === column.id)}
                  allTasks={tasks}
                  onMoveTask={moveTask}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </section>
          )}
        </main>

        {isModalOpen ? (
          <TaskModal
            task={editingTask}
            tasks={tasks}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            isSaving={isSaving}
          />
        ) : null}
      </AppShell>
    </DndProvider>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while syncing tasks.";
}

function ChartIcon() {
  return <TrendingUp size={16} className="text-emerald-200" />;
}
