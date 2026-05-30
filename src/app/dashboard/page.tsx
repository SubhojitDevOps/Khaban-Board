import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function DashboardPage() {
  return (
    <ProtectedRoute href="/dashboard">
      <KanbanBoard />
    </ProtectedRoute>
  );
}
