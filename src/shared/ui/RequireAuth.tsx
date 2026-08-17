import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
