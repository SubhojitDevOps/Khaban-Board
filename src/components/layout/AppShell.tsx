import Link from "next/link";
import {
  Bell,
  Bot,
  ChartNoAxesCombined,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";

type AppShellProps = {
  children: React.ReactNode;
  onCreateTask: () => void;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Issues", icon: Bot, active: false },
  { label: "Roadmap", icon: Waypoints, active: false },
  { label: "Team", icon: Users, active: false },
  { label: "Insights", icon: ChartNoAxesCombined, active: false },
  { label: "Notifications", icon: Bell, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export function AppShell({ children, onCreateTask }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-slate-950/85 p-4 backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3 px-2 py-2">
          <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <Sparkles size={18} />
          </span>
          <span className="font-semibold">Khaban Board</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.active) {
              return (
                <Link
                  key={item.label}
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg bg-cyan-300/10 px-3 py-3 text-sm font-medium text-cyan-100"
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-500"
                title={`${item.label} is planned for a later MVP iteration`}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                <span className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  Soon
                </span>
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bot size={16} />
            AI sprint brief
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            AI suggestions are ready in the workflow; connect an AI API for live generation.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07080d]/82 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400 md:flex">
              <Search size={17} />
              <span className="text-sm">Search tasks, owners, AI notes</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="grid size-10 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/8"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>
              <button
                type="button"
                onClick={onCreateTask}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                <Plus size={17} />
                New task
              </button>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
