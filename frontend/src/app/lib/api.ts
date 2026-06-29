import { API_BASE_URL } from "../../services/config";

export { api } from "../../services/api";
export { API_BASE_URL } from "../../services/config";
export type {
  BackendUser,
  BackendTask,
  BackendDashboard,
  BackendToolCall,
  BackendAgentResponse,
} from "../../services/api";

export function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export { API_BASE_URL };
