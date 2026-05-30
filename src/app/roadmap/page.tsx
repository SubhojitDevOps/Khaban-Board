import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModulePage } from "@/components/modules/ModulePage";

export default function RoadmapPage() {
  return (
    <ProtectedRoute href="/roadmap">
      <ModulePage module="roadmap" />
    </ProtectedRoute>
  );
}
