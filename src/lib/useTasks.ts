"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTasks, normalizeTask } from "@/lib/api";
import type { Task } from "@/types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiTasks = await fetchTasks();
      setTasks(apiTasks.map(normalizeTask));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load tasks.");
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
          setErrorMessage(error instanceof Error ? error.message : "Failed to load tasks.");
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

  return { tasks, isLoading, errorMessage, loadTasks };
}
