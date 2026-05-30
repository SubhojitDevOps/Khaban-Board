import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModulePage } from "@/components/modules/ModulePage";

export default function NotificationsPage() {
  return (
    <ProtectedRoute href="/notifications">
      <ModulePage module="notifications" />
    </ProtectedRoute>
  );
}
