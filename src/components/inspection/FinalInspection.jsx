import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, ClipboardList } from "lucide-react";

export default function FinalInspection() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [failReason, setFailReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: completedJobs = [] } = useQuery({
    queryKey: ["completedJobs"],
    queryFn: () => api.entities.JobCard.getByStatus("Completed"),
  });

  const handlePass = async () => {
    if (!selectedJob) return;
    setProcessing(true);

    try {
      await api.entities.JobCard.update(selectedJob.id, {
        status: "Verified",
        work_done: selectedJob.work_done || selectedJob.approved_repair,
        completion_date: new Date().toISOString().split("T")[0],
      });

      await api.entities.Vehicle.update(selectedJob.vehicle_id, {
        status: "Active",
      });

      await api.entities.Notification.create({
        message: `Vehicle ${selectedJob.plate_number} passed final inspection. Job ${selectedJob.job_number} verified and vehicle released.`,
        type: "completion",
        target_department: "Workshop",
      });

      toast.success("Vehicle passed inspection and released!");
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ["completedJobs"] });
    } catch (err) {
      toast.error(err.message || "Failed to verify job");
    } finally {
      setProcessing(false);
    }
  };

  const handleFail = async () => {
    if (!selectedJob) return;
    setProcessing(true);

    try {
      await api.entities.JobCard.update(selectedJob.id, {
        status: "In Progress",
        notes: selectedJob.notes
          ? selectedJob.notes + "\n---\nRejected: " + failReason
          : "Rejected: " + failReason,
      });

      await api.entities.Notification.create({
        message: `Vehicle ${selectedJob.plate_number} failed final inspection: ${failReason}. Job ${selectedJob.job_number} returned to workshop.`,
        type: "completion",
        target_department: "Workshop",
      });

      toast.success("Job returned to workshop for rework.");
      setSelectedJob(null);
      setFailReason("");
      queryClient.invalidateQueries({ queryKey: ["completedJobs"] });
    } catch (err) {
      toast.error(err.message || "Failed to reject job");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider">Jobs Awaiting Final Inspection</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Job No.</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Plate No.</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Vehicle</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Completed</th>
              </tr>
            </thead>
            <tbody>
              {completedJobs.map(j => (
                <tr
                  key={j.id}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${selectedJob?.id === j.id ? "bg-primary/5" : "hover:bg-muted/50"}`}
                  onClick={() => { setSelectedJob(j); setFailReason(""); }}
                >
                  <td className="py-2.5 px-3 font-semibold">{j.job_number}</td>
                  <td className="py-2.5 px-3 font-semibold">{j.plate_number}</td>
                  <td className="py-2.5 px-3">{j.vehicle_make_model}</td>
                  <td className="py-2.5 px-3 text-xs">{j.completion_date ? format(new Date(j.completion_date), "dd/MM/yyyy") : "-"}</td>
                </tr>
              ))}
              {completedJobs.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No jobs awaiting final inspection.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        {selectedJob ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Job Details: {selectedJob.job_number}</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-xs">Plate Number</span>
                  <p className="font-semibold">{selectedJob.plate_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Vehicle</span>
                  <p className="font-semibold">{selectedJob.vehicle_make_model}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Approved Repair</span>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedJob.approved_repair}</p>
              </div>
              {selectedJob.work_done && (
                <div>
                  <span className="text-muted-foreground text-xs">Work Done</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedJob.work_done}</p>
                </div>
              )}
              {selectedJob.notes && (
                <div>
                  <span className="text-muted-foreground text-xs">Workshop Notes</span>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedJob.notes}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-xs">Assigned Mechanic</span>
                <p className="font-medium">{selectedJob.assigned_mechanic || "Not assigned"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div>
                <span className="text-muted-foreground text-xs">Fail Reason (required if failing)</span>
                <Textarea
                  placeholder="Describe why the job failed inspection..."
                  value={failReason}
                  onChange={e => setFailReason(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePass} disabled={processing} className="bg-green-600 hover:bg-green-700 gap-2">
                  <CheckCircle className="w-4 h-4" /> Pass & Release
                </Button>
                <Button onClick={handleFail} disabled={processing || !failReason.trim()} variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" /> Fail
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            <ClipboardList className="w-5 h-5 mr-2" /> Select a completed job to inspect
          </div>
        )}
      </div>
    </div>
  );
}
