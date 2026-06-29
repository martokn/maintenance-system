import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/api/apiClient";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

const statusColors = {
  "In Progress": "bg-orange-100 text-orange-700",
  "Awaiting Parts": "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Verified: "bg-blue-100 text-blue-700",
};

export default function JobCardList({ jobs, onRefresh }) {
  const completeJob = async (job) => {
    try {
      await api.entities.JobCard.update(job.id, {
        status: "Completed",
        completion_date: new Date().toISOString().split("T")[0],
      });
      await api.entities.Notification.create({
        message: `Job ${job.job_number} for ${job.plate_number} has been completed. Ready for final verification.`,
        type: "completion",
        target_department: "Inspection",
      });
      toast.success("Job marked as completed!");
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to complete job");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider">My Jobs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Job No.</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Plate No.</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Start Date</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 px-3 font-semibold">{j.job_number}</td>
                <td className="py-2.5 px-3 font-semibold">{j.plate_number}</td>
                <td className="py-2.5 px-3">{j.vehicle_make_model}</td>
                <td className="py-2.5 px-3">{j.start_date ? format(new Date(j.start_date), "dd/MM/yyyy") : "-"}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="secondary" className={statusColors[j.status]}>{j.status}</Badge>
                </td>
                <td className="py-2.5 px-3">
                  {j.status === "In Progress" && (
                    <Button size="sm" variant="outline" onClick={() => completeJob(j)} className="gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No job cards yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}