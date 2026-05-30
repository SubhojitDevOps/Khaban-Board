"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Bot,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import { canAccess, canCreateTasks, useAuth, type AuthUser } from "@/components/auth/AuthProvider";
import { logoutUser } from "@/lib/api";

type AppShellProps = {
  children: React.ReactNode;
  onCreateTask?: () => void;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Issues", href: "/issues", icon: Bot },
  { label: "Roadmap", href: "/roadmap", icon: Waypoints },
  { label: "Team", href: "/team", icon: Users },
  { label: "Insights", href: "/insights", icon: ChartNoAxesCombined },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children, onCreateTask }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userCanCreate = user ? canCreateTasks(user.role) : false;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      logout();
    }
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-slate-950/85 p-4 backdrop-blur lg:block">
        <SidebarContent pathname={pathname} onNavigate={() => undefined} logout={handleLogout} user={user} />
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[min(21rem,86vw)] flex-col border-r border-white/10 bg-slate-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <BrandLink />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-300"
                aria-label="Close navigation"
              >
                <X size={19} />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setIsMobileNavOpen(false)}
              logout={handleLogout}
              user={user}
              isMobile
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07080d]/82 px-3 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 lg:hidden">
              <p className="truncate text-sm font-semibold">Khaban Board</p>
              <p className="truncate text-xs text-slate-500">{user?.role || "Workspace"}</p>
            </div>
            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400 md:flex">
              <Search size={17} />
              <span className="truncate text-sm">Search tasks, owners, AI notes</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/notifications"
                className="grid size-10 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/8"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </Link>
              {onCreateTask && userCanCreate ? (
                <button
                  type="button"
                  onClick={onCreateTask}
                  className="inline-flex size-10 items-center justify-center rounded-lg bg-cyan-300 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 sm:size-auto sm:gap-2 sm:px-4 sm:py-2.5"
                  aria-label="New task"
                >
                  <Plus size={17} />
                  <span className="hidden sm:inline">New task</span>
                </button>
              ) : null}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function BrandLink() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3 px-2 py-2">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
        <Sparkles size={18} />
      </span>
      <span className="truncate font-semibold">Khaban Board</span>
    </Link>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  logout,
  user,
  isMobile = false,
}: {
  pathname: string;
  onNavigate: () => void;
  logout: () => void | Promise<void>;
  user: AuthUser | null;
  isMobile?: boolean;
}) {
  return (
    <>
      {!isMobile ? <BrandLink /> : null}
      <nav className={`${isMobile ? "mt-4 flex-1 overflow-y-auto" : "mt-8"} space-y-1`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isAllowed = user ? canAccess(user.role, item.href) : false;

          return (
            <Link
              key={item.label}
              href={isAllowed ? item.href : pathname}
              onClick={onNavigate}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-300/10 text-cyan-100"
                  : isAllowed
                    ? "text-slate-400 hover:bg-white/6 hover:text-slate-100"
                    : "cursor-not-allowed text-slate-600"
              }`}
              title={isAllowed ? item.label : `${item.label} is locked for ${user?.role || "this role"}`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {!isAllowed ? (
                <span className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  Locked
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className={`${isMobile ? "mt-4" : "absolute bottom-4 left-4 right-4"} rounded-lg border border-white/10 bg-white/[0.04] p-4`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bot size={16} />
          AI sprint brief
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {user?.name || "Workspace user"} | {user?.role || "Member"}
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-cyan-100"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </>
  );
}
