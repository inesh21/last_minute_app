import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { LoginPage } from "../pages/LoginPage";
import { AuthCallback } from "../features/auth/AuthCallback";
import { DashboardRoute } from "./routes/DashboardRoute";
import { AICommandRoute } from "./routes/AICommandRoute";
import { CalendarRoute } from "./routes/CalendarRoute";
import { TasksRoute } from "./routes/TasksRoute";
import { DeadlineCenterRoute } from "./routes/DeadlineCenterRoute";
import { PanicModeRoute } from "./routes/PanicModeRoute";
import { FocusModeRoute } from "./routes/FocusModeRoute";
import { WorkspaceRoute } from "./routes/WorkspaceRoute";
import { AnalyticsRoute } from "./routes/AnalyticsRoute";

function LoginGuard() {
  const hasSession = Boolean(localStorage.getItem("jwt_token"));
  if (hasSession) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<AuthenticatedLayout />}>
          <Route index element={<DashboardRoute />} />
          <Route path="ai-command" element={<AICommandRoute />} />
          <Route path="calendar" element={<CalendarRoute />} />
          <Route path="tasks" element={<TasksRoute />} />
          <Route path="deadlines" element={<DeadlineCenterRoute />} />
          <Route path="panic" element={<PanicModeRoute />} />
          <Route path="focus" element={<FocusModeRoute />} />
          <Route path="workspace" element={<WorkspaceRoute />} />
          <Route path="analytics" element={<AnalyticsRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
