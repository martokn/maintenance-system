import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  "Awaiting Approval": "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
  Verified: "bg-purple-100 text-purple-700",
};

const priorityColors = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

export default function InspectionTable({ reports, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider">Recent Inspections</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Plate No.</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Vehicle</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Inspector</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 px-4 font-semibold">{r.plate_number}</td>
                <td className="py-2.5 px-4">{r.vehicle_make_model}</td>
                <td className="py-2.5 px-4">{r.inspector_name}</td>
                <td className="py-2.5 px-4">{r.inspection_date ? format(new Date(r.inspection_date), "dd/MM/yyyy") : "-"}</td>
                <td className="py-2.5 px-4">
                  <Badge variant="secondary" className={priorityColors[r.priority]}>{r.priority}</Badge>
                </td>
                <td className="py-2.5 px-4">
                  <Badge variant="secondary" className={statusColors[r.status]}>{r.status}</Badge>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No inspection reports yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}