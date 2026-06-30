import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "green" | "amber" | "orange" | "rose" | "blue" | "purple" }) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    green:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    orange:  "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    rose:    "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    blue:    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    purple:  "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-[family-name:var(--font-mono,'DM_Mono')] ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, color = "bg-primary", className = "" }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-1.5 w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Btn({
  children, onClick, variant = "primary", className = "", disabled = false
}: {
  children: ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string; disabled?: boolean;
}) {
  const variants = {
    primary:   "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
    ghost:     "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger:    "bg-rose-500 text-white hover:bg-rose-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
