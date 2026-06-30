import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, MessageSquare, Calendar, CheckSquare,
  AlertTriangle, Zap, Focus, FolderOpen, BarChart2,
  Moon, Sun, Bell, LogOut, ChevronRight, ChevronLeft,
} from "lucide-react";
import { api, type BackendUser, type BackendDashboard, type BackendTask } from "../services/api";
import { Badge } from "../components/shared";

const iconMap = {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Zap,
  Focus,
  FolderOpen,
  BarChart2,
} as const;

const navItems = [
  { id: "dashboard",  path: "/",           label: "Dashboard",      icon: "LayoutDashboard" as const },
  { id: "ai-command", path: "/ai-command", label: "AI Command",     icon: "MessageSquare"   as const },
  { id: "calendar",   path: "/calendar",   label: "Calendar",       icon: "Calendar"        as const },
  { id: "tasks",      path: "/tasks",      label: "Tasks",          icon: "CheckSquare"     as const },
  { id: "deadlines",  path: "/deadlines",  label: "Deadline Center",icon: "AlertTriangle"   as const },
  { id: "panic",      path: "/panic",      label: "Panic Mode",     icon: "Zap"             as const },
  { id: "focus",      path: "/focus",      label: "Focus Mode",     icon: "Focus"           as const },
  { id: "workspace",  path: "/workspace",  label: "AI Workspace",   icon: "FolderOpen"      as const },
  { id: "analytics",  path: "/analytics",  label: "Analytics",      icon: "BarChart2"       as const },
];

export type AppContext = {
  user: BackendUser | null;
  dashboard: BackendDashboard | null;
  tasks: BackendTask[];
  backendStatus: "connecting" | "connected" | "offline";
  loadBackendData: () => void;
};

export function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [dashboard, setDashboard] = useState<BackendDashboard | null>(null);
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "connected" | "offline">("connecting");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Continue with local logout even if server call fails
    }
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("auth_session");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("user_id");
    setUser(null);
    setDashboard(null);
    setTasks([]);
    navigate("/login");
  };

  const loadBackendData = useCallback(async () => {
    setBackendStatus("connecting");
    try {
      const [dashboardData, taskData] = await Promise.all([
        api.getDashboard(),
        api.getTasks(),
      ]);
      setDashboard(dashboardData);
      setTasks(taskData);
      setBackendStatus("connected");
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }
    api.getMe().then(u => {
      setUser(u);
      loadBackendData();
    }).catch(() => {
      localStorage.removeItem("jwt_token");
      navigate("/login");
    });
  }, [loadBackendData, navigate]);

  const isPanic = location.pathname === "/panic";
  const isFocus = location.pathname === "/focus";

  const currentLabel = navItems.find(n => n.path === location.pathname)?.label ?? "";

  const context: AppContext = { user, dashboard, tasks, backendStatus, loadBackendData };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className={`flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${sidebarOpen ? "w-56" : "w-[60px]"}`}>
          <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-sidebar-border ${sidebarOpen ? "justify-between" : "justify-center"}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap size={15} className="text-primary-foreground" />
              </div>
              {sidebarOpen && <span className="text-sm font-semibold truncate text-sidebar-foreground font-[Plus_Jakarta_Sans]">LML</span>}
            </div>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors cursor-pointer flex-shrink-0">
                <ChevronLeft size={15} />
              </button>
            )}
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              const Icon = iconMap[item.icon];
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.path); if (!sidebarOpen) setSidebarOpen(true); }}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all cursor-pointer group ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  } ${!sidebarOpen ? "justify-center" : ""}`}
                >
                  <Icon size={16} className={`flex-shrink-0 ${item.id === "panic" ? "text-rose-500" : ""}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {sidebarOpen && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          <div className={`p-2 border-t border-sidebar-border space-y-1 ${sidebarOpen ? "" : "flex flex-col items-center"}`}>
            <button
              onClick={() => setDark(d => !d)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors cursor-pointer ${sidebarOpen ? "w-full" : ""}`}
            >
              {dark ? <Sun size={15} className="text-amber-400 flex-shrink-0" /> : <Moon size={15} className="flex-shrink-0" />}
              {sidebarOpen && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors cursor-pointer ${sidebarOpen ? "w-full" : ""}`}
            >
              <LogOut size={15} className="flex-shrink-0" />
              {sidebarOpen && <span>Sign out</span>}
            </button>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors cursor-pointer">
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{currentLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              {isPanic && <Badge variant="rose">Emergency Active</Badge>}
              {isFocus && <Badge variant="purple">Focus Session</Badge>}

              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setShowNotifications(n => !n); setShowUserMenu(false); }}
                  className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
                >
                  <Bell size={15} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-xl shadow-lg z-50 p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">Notifications</p>
                    {[
                      { text: "Risk score increased — check your deadlines", time: "2m ago", dot: "bg-rose-500" },
                      { text: "Deadline approaching for your top task", time: "15m ago", dot: "bg-amber-400" },
                      { text: "AI recommendation available", time: "1h ago", dot: "bg-blue-400" },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div>
                          <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => { setShowUserMenu(m => !m); setShowNotifications(false); }}
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                >
                  {user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-lg z-50 p-2">
                    <div className="px-2 py-2 border-b border-border mb-1">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5">
            <Outlet context={context} />
          </main>
        </div>
      </div>
    </div>
  );
}
