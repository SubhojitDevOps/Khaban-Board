import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModulePage } from "@/components/modules/ModulePage";

export default function IssuesPage() {
  return (
    <ProtectedRoute href="/issues">
      <ModulePage module="issues" />
    </ProtectedRoute>
  );
}
