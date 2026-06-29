import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import DeptHeader from "@/components/shared/DeptHeader";
import StatCard from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, MessageSquare } from "lucide-react";

export default function ApproverPortal() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [comments, setComments] = useState("");
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["approverReports"],
    queryFn: () => api.entities.InspectionReport.list("-created_date"),
  });

  const pending = reports.filter(r => r.status === "Awaiting Approval");
  const approved = reports.filter(r => r.status === "Approved");
  const rejected = reports.filter(r => r.status === "Rejected");

  const handleDecision = async (decision) => {
    if (!selectedReport) return;
    setProcessing(true);

    try {
      const user = await api.auth.me();

      await api.entities.InspectionReport.update(selectedReport.id, {
        status: decision,
        department_comments: comments,
        approved_by: user?.full_name || "Approver",
        approval_date: new Date().toISOString().split("T")[0],
      });

      if (decision === "Rejected") {
        await api.entities.Vehicle.update(selectedReport.vehicle_id, { status: "Active" });
      }

      await api.entities.Notification.create({
        message: `${decision === "Approved" ? "✅" : "❌"} Inspection report for ${selectedReport.plate_number} has been ${decision.toLowerCase()} by ${user?.full_name || "Approver"}`,
        type: "approval",
        target_department: decision === "Approved" ? "Workshop" : "Inspection",
      });

      toast.success(`Report ${decision.toLowerCase()} successfully!`);
      setSelectedReport(null);
      setComments("");
      setProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["approverReports"] });
    } catch (err) {
      toast.error(err.message || `Failed to ${decision.toLowerCase()} report`);
      setProcessing(false);
    }
  };

  const priorityColors = {
    Low: "bg-gray-100 text-gray-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Critical: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DeptHeader number={2} title="Department Approver Portal" color="green" />
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard label="Pending Requests" value={pending.length} color="bg-orange-500" />
            <StatCard label="Approved Today" value={approved.length} color="bg-green-600" />
            <StatCard label="Rejected" value={rejected.length} color="bg-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider">Pending Approval Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Plate No.</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Dept</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(r => (
                  <tr
                    key={r.id}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${selectedReport?.id === r.id ? "bg-primary/5" : "hover:bg-muted/50"}`}
                    onClick={() => { setSelectedReport(r); setComments(""); }}
                  >
                    <td className="py-2.5 px-3 font-semibold">{r.plate_number}</td>
                    <td className="py-2.5 px-3">{r.vehicle_make_model}</td>
                    <td className="py-2.5 px-3 text-xs">{r.vehicle_department}</td>
                    <td className="py-2.5 px-3 text-xs">{r.inspection_date ? format(new Date(r.inspection_date), "dd/MM/yyyy") : "-"}</td>
                  </tr>
                ))}
                {pending.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No pending requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-card rounded-xl border border-border p-5">
          {selectedReport ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">Request Details</h3>
              <div className="space-y-3">
                <p className="font-semibold">Vehicle: {selectedReport.plate_number} — {selectedReport.vehicle_make_model}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Department</span>
                    <p className="font-medium">{selectedReport.vehicle_department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Priority</span>
                    <p><Badge variant="secondary" className={priorityColors[selectedReport.priority]}>{selectedReport.priority}</Badge></p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Inspector Findings</span>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedReport.findings}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Recommended Parts</span>
                    <p className="font-medium">{selectedReport.recommended_parts || "None specified"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Estimated Cost</span>
                    <p className="font-medium">KES {selectedReport.estimated_cost?.toLocaleString() || 0}</p>
                  </div>
                </div>
                {selectedReport.photos?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Photos</span>
                    <div className="flex gap-2 mt-1">
                      {selectedReport.photos.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-xs">Comments</span>
                  <Textarea
                    placeholder="Add comments..."
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleDecision("Approved")} disabled={processing} className="bg-green-600 hover:bg-green-700 gap-2">
                    <Check className="w-4 h-4" /> Approve
                  </Button>
                  <Button onClick={() => handleDecision("Rejected")} disabled={processing} variant="destructive" className="gap-2">
                    <X className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              <MessageSquare className="w-5 h-5 mr-2" /> Select a request to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}