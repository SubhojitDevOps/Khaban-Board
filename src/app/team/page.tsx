import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModulePage } from "@/components/modules/ModulePage";

export default function TeamPage() {
  return (
    <ProtectedRoute href="/team">
      <ModulePage module="team" />
    </ProtectedRoute>
  );
}
