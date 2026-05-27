import Link from "next/link";
import { ArrowRight, Bell, Bot, ChartNoAxesCombined, Sparkles, Users, Workflow } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI task shaping",
    copy: "Turn loose startup goals into sharper tickets, owners, and next actions.",
  },
  {
    icon: Workflow,
    title: "Jira-inspired flow",
    copy: "Simple columns, fast drag and drop, and enough structure for a real sprint.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Execution signal",
    copy: "Spot priority, progress, and blockers without opening a reporting maze.",
  },
  {
    icon: Users,
    title: "Team-ready tickets",
    copy: "Assign owners, sprint work, project tags, estimates, blockers, and parent-child tasks.",
  },
  {
    icon: Bell,
    title: "Notifications-ready",
    copy: "A lightweight activity model for task changes, blocked work, and sprint movement.",
  },
  {
    icon: Sparkles,
    title: "Affordable Jira alternative",
    copy: "Built for small teams, freelancers, and startups that need speed before ceremony.",
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07080d] text-slate-100">
      <section className="subtle-grid relative flex min-h-[92vh] flex-col px-5 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_76%_18%,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(7,8,13,0.28),#07080d_86%)]" />
        <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Sparkles size={18} />
            </span>
            <span className="text-lg font-semibold tracking-tight">Khaban Board</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            Open app
            <ArrowRight size={16} />
          </Link>
        </nav>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center py-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-sm text-teal-100">
                <Sparkles size={15} />
                Free, lightweight Jira-style project management
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Khaban Board
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A fast, modern workspace for small teams, startups, and freelancers to manage tasks, bugs, sprints,
                collaboration, and AI-powered productivity suggestions without Jira-sized overhead.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Launch dashboard
                  <ArrowRight size={17} />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center justify-center rounded-lg border border-white/12 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/8"
                >
                  View workflow
                </a>
              </div>
            </div>

            <div className="glass-panel rounded-lg p-4">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Sprint intelligence</p>
                  <h2 className="text-xl font-semibold">Launch room</h2>
                </div>
                <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
                  84% healthy
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Todo", "In progress", "Done"].map((column, index) => (
                  <div key={column} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{column}</p>
                    <div className="space-y-3">
                      {Array.from({ length: index === 2 ? 2 : 3 }).map((_, item) => (
                        <div key={item} className="rounded-lg border border-white/10 bg-slate-950/70 p-3">
                          <div className="mb-3 h-2 w-16 rounded-full bg-cyan-200/60" />
                          <div className="h-2 rounded-full bg-slate-700" />
                          <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-800" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <feature.icon className="mb-5 text-cyan-200" size={26} />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-3 leading-7 text-slate-400">{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-slate-950 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">AI productivity workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">From idea fog to demo-ready work.</h2>
              <p className="mt-4 leading-7 text-slate-400">
                Khaban Board keeps work compact: capture tasks and bugs, assign ownership, plan sprint scope, track
                status, surface blockers, and summarize progress with AI nudges where teams usually lose time.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {["Capture", "Assign", "Execute", "Analyze"].map((step, index) => (
                <div key={step} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <span className="text-sm text-slate-500">0{index + 1}</span>
                  <h3 className="mt-4 font-semibold">{step}</h3>
                  <div className="mt-5 h-1 rounded-full bg-cyan-200/70" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
