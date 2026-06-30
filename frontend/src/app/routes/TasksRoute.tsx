import { useAppContext } from "../../hooks/useAppContext";
import { TasksPage } from "../../pages/TasksPage";

export function TasksRoute() {
  const { tasks, loadBackendData } = useAppContext();
  return <TasksPage tasks={tasks} onTasksChange={loadBackendData} />;
}
