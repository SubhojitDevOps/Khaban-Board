"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "Admin" | "Manager" | "Member" | "Viewer";

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
  sessionToken: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (user: AuthUser) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
};

export const AUTH_STORAGE_KEY = "khaban-board-user";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login: (nextUser) => {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      updateUser: (nextUser) => {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      },
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function canAccess(role: UserRole, href: string) {
  const permissions: Record<UserRole, string[]> = {
    Admin: ["/dashboard", "/issues", "/roadmap", "/team", "/insights", "/notifications", "/settings"],
    Manager: ["/dashboard", "/issues", "/roadmap", "/team", "/insights", "/notifications"],
    Member: ["/dashboard", "/issues", "/roadmap", "/insights", "/notifications"],
    Viewer: ["/dashboard", "/issues", "/insights", "/notifications"],
  };

  return permissions[role].includes(href);
}

export function canCreateTasks(role: UserRole) {
  return role === "Admin" || role === "Manager" || role === "Member";
}
