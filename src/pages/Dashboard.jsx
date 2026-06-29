import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import StatCard from "@/components/shared/StatCard";
import DeptHeader from "@/components/shared/DeptHeader";
import { Link } from "react-router-dom";
import { 
  ClipboardCheck, Building2, Wrench, Package, ArrowRight,
  Search, FileText, ListChecks, BarChart3
} from "lucide-react";
import { format } from "date-fns";

const workflowSteps = [
  { num: 1, title: "Inspection Department", color: "bg-primary", items: ["Inspect Vehicle", "Create Inspection Report", "Attach Photos & Findings", "Submit to Department"], doc: "Inspection Report" },
  { num: 2, title: "Department Approver", color: "bg-green-600", items: ["Receive Inspection Report", "Verify Vehicle Ownership", "Approve or Reject", "Send Decision Back"], doc: "Approval / Rejection Document" },
  { num: 3, title: "Maintenance Workshop", color: "bg-orange-500", items: ["Receive Approved Report", "Create Job Card", "Request Parts from Stores", "Perform Repair"], doc: "Parts Request Document" },
  { num: 4, title: "Inventory / Stores", color: "bg-purple-700", items: ["Receive Parts Request", "Check Stock Availability", "Issue Parts", "Deduct Stock"], doc: "Completion Report" },
];

export default function Dashboard() {
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => api.entities.Vehicle.list() });
  const { data: reports = [] } = useQuery({ queryKey: ["reports"], queryFn: () => api.entities.InspectionReport.list() });
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: () => api.entities.JobCard.list() });
  const { data: inventory = [] } = useQuery({ queryKey: ["inventory"], queryFn: () => api.entities.InventoryItem.list() });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => api.entities.Notification.list("-created_date", 5) });

  const inMaintenance = vehicles.filter(v => v.status === "In Maintenance").length;
  const lowStock = inventory.filter(i => i.quantity_in_stock <= i.reorder_level).length;

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-5">Workflow Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workflowSteps.map((step, i) => (
            <div key={step.num} className="relative">
              <div className={`${step.color} rounded-lg p-4 text-white`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{step.num}</span>
                  <span className="text-xs font-bold uppercase tracking-wide">{step.title}</span>
                </div>
                <ul className="space-y-1">
                  {step.items.map(item => (
                    <li key={item} className="text-[11px] text-white/80 flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-white/50 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-white/50 mt-3 pt-2 border-t border-white/20">{step.doc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-muted border border-border items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4 Department Portals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link to="/inspection" className="group">
          <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <DeptHeader number={1} title="Inspection Department" color="blue" />
            <div className="p-4 grid grid-cols-3 gap-3">
              <StatCard label="Pending" value={reports.filter(r => r.status === "Awaiting Approval").length} color="bg-primary" />
              <StatCard label="Approved" value={reports.filter(r => r.status === "Approved").length} color="bg-green-600" />
              <StatCard label="Completed" value={reports.filter(r => ["Completed", "Verified"].includes(r.status)).length} color="bg-blue-600" />
            </div>
          </div>
        </Link>

        <Link to="/approver" className="group">
          <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <DeptHeader number={2} title="Department Approver" color="green" />
            <div className="p-4 grid grid-cols-3 gap-3">
              <StatCard label="Pending" value={reports.filter(r => r.status === "Awaiting Approval").length} color="bg-orange-500" />
              <StatCard label="Approved" value={reports.filter(r => r.status === "Approved").length} color="bg-green-600" />
              <StatCard label="Rejected" value={reports.filter(r => r.status === "Rejected").length} color="bg-red-500" />
            </div>
          </div>
        </Link>

        <Link to="/workshop" className="group">
          <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <DeptHeader number={3} title="Maintenance Workshop" color="orange" />
            <div className="p-4 grid grid-cols-3 gap-3">
              <StatCard label="In Progress" value={jobs.filter(j => j.status === "In Progress").length} color="bg-orange-500" />
              <StatCard label="Awaiting Parts" value={jobs.filter(j => j.status === "Awaiting Parts").length} color="bg-purple-600" />
              <StatCard label="Completed" value={jobs.filter(j => ["Completed", "Verified"].includes(j.status)).length} color="bg-green-600" />
            </div>
          </div>
        </Link>

        <Link to="/stores" className="group">
          <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <DeptHeader number={4} title="Inventory / Stores" color="purple" />
            <div className="p-4 grid grid-cols-3 gap-3">
              <StatCard label="Parts In Stock" value={inventory.reduce((s, i) => s + (i.quantity_in_stock || 0), 0)} color="bg-purple-600" />
              <StatCard label="Items" value={inventory.length} color="bg-blue-600" />
              <StatCard label="Low Stock" value={lowStock} color="bg-red-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom Row: Notifications + System Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Notifications</h4>
          <div className="space-y-3">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications yet.</p>}
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(n.created_date), "hh:mm a")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4">System Summary</h4>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Vehicles" value={vehicles.length} color="bg-primary" />
            <StatCard label="In Maintenance" value={inMaintenance} color="bg-orange-500" />
            <StatCard label="Parts In Stock" value={inventory.reduce((s, i) => s + (i.quantity_in_stock || 0), 0)} color="bg-green-600" />
            <StatCard label="Low Stock" value={lowStock} color="bg-red-500" />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/inspection" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                <Search className="w-3 h-3" /> Vehicle Search
              </Link>
              <Link to="/inspection" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                <FileText className="w-3 h-3" /> Inspection Reports
              </Link>
              <Link to="/workshop" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                <ListChecks className="w-3 h-3" /> Work Orders
              </Link>
              <Link to="/stores" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
                <BarChart3 className="w-3 h-3" /> Stock Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}