import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, ClipboardCheck, Building2, Wrench, 
  Package, LogOut, ChevronLeft, ChevronRight, Shield
} from "lucide-react";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Inspection Department", path: "/inspection", icon: ClipboardCheck },
  { label: "Department Approver", path: "/approver", icon: Building2 },
  { label: "Maintenance Workshop", path: "/workshop", icon: Wrench },
  { label: "Inventory / Stores", path: "/stores", icon: Package },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { logout: authLogout } = useAuth();

  const handleLogout = () => {
    api.auth.logout();
    authLogout();
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-xs font-bold uppercase tracking-wider text-sidebar-primary">County</h1>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wide">Government</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}