import { useAppContext } from "../../hooks/useAppContext";
import { DashboardPage } from "../../pages/DashboardPage";

export function DashboardRoute() {
  const { dashboard, tasks, backendStatus, user } = useAppContext();
  return <DashboardPage dashboard={dashboard} tasks={tasks} backendStatus={backendStatus} user={user} />;
}
