"use client";

import { Loader2, Lock } from "lucide-react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { canAccess, useAuth } from "@/components/auth/AuthProvider";

export function ProtectedRoute({ href, children }: { href: string; children: React.ReactNode }) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07080d] text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="animate-spin text-cyan-200" size={18} />
          Loading workspace...
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!canAccess(user.role, href)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07080d] px-5 text-slate-100">
        <section className="max-w-md rounded-lg border border-white/10 bg-slate-950 p-6 text-center">
          <Lock className="mx-auto text-amber-200" size={32} />
          <h1 className="mt-4 text-2xl font-semibold">Role access required</h1>
          <p className="mt-3 leading-7 text-slate-400">
            Your current role does not have access to this module. Switch to Admin or Manager in the demo login to explore it.
          </p>
        </section>
      </main>
    );
  }

  return children;
}
