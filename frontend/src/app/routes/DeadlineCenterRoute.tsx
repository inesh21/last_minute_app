import { useAppContext } from "../../hooks/useAppContext";
import { DeadlineCenterPage } from "../../pages/DeadlineCenterPage";

export function DeadlineCenterRoute() {
  const { tasks } = useAppContext();
  return <DeadlineCenterPage tasks={tasks} />;
}
