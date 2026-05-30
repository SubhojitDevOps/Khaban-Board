import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModulePage } from "@/components/modules/ModulePage";

export default function SettingsPage() {
  return (
    <ProtectedRoute href="/settings">
      <ModulePage module="settings" />
    </ProtectedRoute>
  );
}
