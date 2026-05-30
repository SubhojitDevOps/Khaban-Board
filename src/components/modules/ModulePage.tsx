"use client";

import {
  Bell,
  Bot,
  ChartNoAxesCombined,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Settings,
  Users,
  Waypoints,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, type UserRole } from "@/components/auth/AuthProvider";
import { useTasks } from "@/lib/useTasks";
import type { Task } from "@/types/task";

type ModuleKey = "issues" | "roadmap" | "team" | "insights" | "notifications" | "settings";

const moduleMeta: Record<ModuleKey, { title: string; eyebrow: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  issues: {
    title: "Issue Tracking",
    eyebrow: "Bugs, tasks, and incidents",
    description: "A live issue register powered by your Google Sheets task database.",
    icon: Bot,
  },
  roadmap: {
    title: "Roadmap",
    eyebrow: "Sprint and release planning",
    description: "Plan work by active, upcoming, and completed delivery lanes.",
    icon: Waypoints,
  },
  team: {
    title: "Team Management",
    eyebrow: "Roles and assignments",
    description: "Review owner load and role access from the current workspace.",
    icon: Users,
  },
  insights: {
    title: "Analytics Dashboard",
    eyebrow: "Delivery intelligence",
    description: "Live metrics for completion, blockers, bugs, and workload.",
    icon: ChartNoAxesCombined,
  },
  notifications: {
    title: "Notifications",
    eyebrow: "Activity and alerts",
    description: "Actionable alerts for blockers, urgent work, and overdue-looking tasks.",
    icon: Bell,
  },
  settings: {
    title: "Settings",
    eyebrow: "Workspace configuration",
    description: "Manage demo role access, connected services, and workflow defaults.",
    icon: Settings,
  },
};

const roles: UserRole[] = ["Admin", "Manager", "Member", "Viewer"];

export function ModulePage({ module }: { module: ModuleKey }) {
  const content = moduleMeta[module];
  const Icon = content.icon;
  const { tasks, isLoading, errorMessage, loadTasks } = useTasks();

  return (
    <AppShell>
      <main className="px-3 py-5 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                <Icon size={15} />
                {content.eyebrow}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-4xl">{content.title}</h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-400">{content.description}</p>
            </div>
            <button
              type="button"
              onClick={loadTasks}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </section>

        {errorMessage ? (
          <section className="mb-5 rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
            {errorMessage}
          </section>
        ) : null}

        {isLoading ? (
          <section className="grid min-h-[320px] place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-300">
            <div className="flex items-center gap-3 text-sm">
              <Loader2 className="animate-spin text-cyan-200" size={18} />
              Loading live workspace data...
            </div>
          </section>
        ) : (
          <LiveModule module={module} tasks={tasks} />
        )}
      </main>
    </AppShell>
  );
}

function LiveModule({ module, tasks }: { module: ModuleKey; tasks: Task[] }) {
  if (module === "issues") {
    return <IssuesView tasks={tasks} />;
  }

  if (module === "roadmap") {
    return <RoadmapView tasks={tasks} />;
  }

  if (module === "team") {
    return <TeamView tasks={tasks} />;
  }

  if (module === "insights") {
    return <InsightsView tasks={tasks} />;
  }

  if (module === "notifications") {
    return <NotificationsView tasks={tasks} />;
  }

  return <SettingsView tasks={tasks} />;
}

function IssuesView({ tasks }: { tasks: Task[] }) {
  const issues = tasks.filter((task) => isBug(task) || task.blocked || task.priority === "Urgent" || task.priority === "High");

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Live issue queue</h2>
        <div className="space-y-3">
          {(issues.length ? issues : tasks).map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </section>
      <MetricRail
        metrics={[
          ["Bugs", String(tasks.filter(isBug).length)],
          ["Blocked", String(tasks.filter((task) => task.blocked).length)],
          ["Urgent", String(tasks.filter((task) => task.priority === "Urgent").length)],
        ]}
      />
    </div>
  );
}

function RoadmapView({ tasks }: { tasks: Task[] }) {
  const lanes = [
    { title: "Now", tasks: tasks.filter((task) => task.status === "IN_PROGRESS") },
    { title: "Next", tasks: tasks.filter((task) => task.status === "TODO") },
    { title: "Shipped", tasks: tasks.filter((task) => task.status === "DONE") },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {lanes.map((lane) => (
        <div key={lane.title} className="min-h-80 rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{lane.title}</h2>
            <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400">{lane.tasks.length}</span>
          </div>
          <div className="space-y-3">
            {lane.tasks.map((task) => (
              <TaskRow key={task.id} task={task} compact />
            ))}
            {lane.tasks.length === 0 ? <EmptyState label="No tickets in this lane" /> : null}
          </div>
        </div>
      ))}
    </section>
  );
}

function TeamView({ tasks }: { tasks: Task[] }) {
  const ownerEntries = Object.entries(
    tasks.reduce<Record<string, Task[]>>((groups, task) => {
      const owner = task.owner || "Unassigned";
      groups[owner] = [...(groups[owner] || []), task];
      return groups;
    }, {}),
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="grid gap-4 md:grid-cols-2">
        {ownerEntries.map(([owner, ownerTasks]) => (
          <article key={owner} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{owner}</h2>
                <p className="text-sm text-slate-500">{ownerTasks.length} assigned tickets</p>
              </div>
              <Users size={20} className="text-cyan-200" />
            </div>
            <div className="space-y-2">
              {ownerTasks.slice(0, 4).map((task) => (
                <TaskRow key={task.id} task={task} compact />
              ))}
            </div>
          </article>
        ))}
        {ownerEntries.length === 0 ? <EmptyState label="No team assignments yet" /> : null}
      </section>
      <AccessMatrix />
    </div>
  );
}

function InsightsView({ tasks }: { tasks: Task[] }) {
  const done = tasks.filter((task) => task.status === "DONE").length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard title="Completion" value={`${completion}%`} />
        <InsightCard title="Open tickets" value={String(tasks.filter((task) => task.status !== "DONE").length)} />
        <InsightCard title="Blocked" value={String(tasks.filter((task) => task.blocked).length)} />
        <InsightCard title="Bugs" value={String(tasks.filter(isBug).length)} />
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Status workflow</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
            <div key={status} className="rounded-lg border border-white/10 bg-slate-950 p-4">
              <p className="text-sm text-slate-500">{status}</p>
              <p className="mt-2 text-3xl font-semibold">{tasks.filter((task) => task.status === status).length}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NotificationsView({ tasks }: { tasks: Task[] }) {
  const alerts = tasks.filter((task) => task.blocked || task.priority === "Urgent" || task.priority === "High");

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Live alerts</h2>
      <div className="space-y-3">
        {alerts.map((task) => (
          <div key={task.id} className="rounded-lg border border-white/10 bg-slate-950 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold">{task.title}</h3>
              <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100">
                {task.blocked ? "Blocked" : task.priority}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {task.blockerReason || task.aiHint || "High attention ticket needs review."}
            </p>
          </div>
        ))}
        {alerts.length === 0 ? <EmptyState label="No active alerts" /> : null}
      </div>
    </section>
  );
}

function SettingsView({ tasks }: { tasks: Task[] }) {
  const { user, updateUser } = useAuth();

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Display name
            <input
              value={user?.name || ""}
              onChange={(event) => user && updateUser({ ...user, name: event.target.value })}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Role access
            <select
              value={user?.role || "Viewer"}
              onChange={(event) => user && updateUser({ ...user, role: event.target.value as UserRole })}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
            >
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <InsightCard title="Auth mode" value="Demo" />
          <InsightCard title="Database" value="Sheets" />
          <InsightCard title="AI" value="Gemini" />
        </div>
      </section>
      <MetricRail
        metrics={[
          ["Total tickets", String(tasks.length)],
          ["Projects", String(new Set(tasks.map((task) => task.project).filter(Boolean)).size)],
          ["Owners", String(new Set(tasks.map((task) => task.owner).filter(Boolean)).size)],
        ]}
      />
    </div>
  );
}

function TaskRow({ task, compact = false }: { task: Task; compact?: boolean }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{task.title}</h3>
          {!compact ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{task.description}</p> : null}
        </div>
        <span className="shrink-0 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
          {task.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded-md bg-white/[0.04] px-2 py-1">{task.priority}</span>
        <span className="rounded-md bg-white/[0.04] px-2 py-1">{task.owner || "Unassigned"}</span>
        {task.sprint ? <span className="rounded-md bg-white/[0.04] px-2 py-1">{task.sprint}</span> : null}
        {task.blocked ? <span className="rounded-md bg-rose-400/10 px-2 py-1 text-rose-100">Blocked</span> : null}
      </div>
    </article>
  );
}

function MetricRail({ metrics }: { metrics: Array<[string, string]> }) {
  return (
    <aside className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
      {metrics.map(([label, value]) => (
        <article key={label} className="rounded-lg border border-white/10 bg-slate-950 p-4">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-100">{value}</p>
        </article>
      ))}
    </aside>
  );
}

function AccessMatrix() {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Role matrix</h2>
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
            <span>{role}</span>
            <CheckCircle2 size={16} className="text-emerald-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

function InsightCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-cyan-100">{value}</p>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/12 p-8 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

function isBug(task: Task) {
  return task.labels?.toLowerCase().includes("bug") || task.title.toLowerCase().includes("bug");
}
