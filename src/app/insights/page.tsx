import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModulePage } from "@/components/modules/ModulePage";

export default function InsightsPage() {
  return (
    <ProtectedRoute href="/insights">
      <ModulePage module="insights" />
    </ProtectedRoute>
  );
}
