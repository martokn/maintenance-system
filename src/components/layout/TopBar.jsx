import React from "react";
import { Bell, User } from "lucide-react";
import { format } from "date-fns";

const roleLabels = {
  admin: "System Administrator",
  inspector: "Inspection Department",
  department_approver: "Department Approver",
  workshop: "Maintenance Workshop",
  stores: "Inventory / Stores"
};

export default function TopBar({ user }) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          COUNTY VEHICLE MAINTENANCE MANAGEMENT SYSTEM
        </h2>
        <p className="text-xs text-muted-foreground -mt-0.5">
          Four Department Workflow — Inspection → Approval → Maintenance → Inventory → Completion
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          {format(new Date(), "dd MMM yyyy | hh:mm a")}
        </span>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold">{user?.full_name || "User"}</p>
            <p className="text-[10px] text-muted-foreground">{roleLabels[user?.role] || "Inspector"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}