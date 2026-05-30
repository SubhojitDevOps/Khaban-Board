"use client";

import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth, type UserRole } from "@/components/auth/AuthProvider";
import { loginUser, signupUser } from "@/lib/api";

const roles: UserRole[] = ["Admin", "Manager", "Member", "Viewer"];

export function AuthScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("Subhojit");
  const [email, setEmail] = useState("subhojit@example.com");
  const [role, setRole] = useState<UserRole>("Admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const normalizedEmail = email.trim();
      const user = mode === "signup"
        ? await signupUser({
            name: name.trim() || "Khaban User",
            email: normalizedEmail,
            role,
          })
        : await loginUser(normalizedEmail);

      login({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#07080d] px-5 py-10 text-slate-100">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white/10 bg-slate-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <Sparkles size={19} />
          </span>
          <div>
            <p className="text-sm text-cyan-200">Khaban Board</p>
            <h1 className="text-2xl font-semibold">{mode === "login" ? "Login" : "Create workspace account"}</h1>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                mode === item ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-300">
            Workspace role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              disabled={mode === "login"}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-slate-100 outline-none transition focus:border-cyan-300/50"
            >
              {roles.map((roleOption) => (
                <option key={roleOption}>{roleOption}</option>
              ))}
            </select>
          </label>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm leading-6 text-rose-100">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 rounded-lg border border-cyan-300/15 bg-cyan-300/8 p-3 text-sm leading-6 text-cyan-50">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <ShieldCheck size={15} />
            Demo role access
          </div>
          Admin sees everything. Managers manage team and planning. Members work tickets. Viewers can only inspect.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}
          {isSubmitting ? "Checking workspace..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
