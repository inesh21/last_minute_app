import { useOutletContext } from "react-router";
import type { AppContext } from "../layouts/AuthenticatedLayout";

export function useAppContext() {
  return useOutletContext<AppContext>();
}
