import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: () => <Navigate to="/dashboard/chat" replace />,
});
