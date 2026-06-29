import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateJobCard({ approvedReports, onSuccess, onCancel }) {
  const [reportId, setReportId] = useState("");
  const [mechanic, setMechanic] = useState("");
  const [repairDesc, setRepairDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = approvedReports.find(r => r.id == reportId);

  const handleCreate = async () => {
    if (!reportId || !repairDesc) {
      toast.error("Select a report and describe the repair.");
      return;
    }
    setSaving(true);
    const jobNum = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;

    try {
      await api.entities.JobCard.create({
        job_number: jobNum,
        inspection_report_id: reportId,
        vehicle_id: selected.vehicle_id,
        plate_number: selected.plate_number,
        vehicle_make_model: selected.vehicle_make_model,
        approved_repair: repairDesc,
        assigned_mechanic: mechanic,
        start_date: new Date().toISOString().split("T")[0],
        status: "In Progress",
      });

      await api.entities.Notification.create({
        message: `New job card ${jobNum} created for ${selected.plate_number}`,
        type: "info",
        target_department: "Workshop",
      });

      toast.success("Job card created!");
      setSaving(false);
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to create job card");
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-5">Create Job Card</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Approved Report</Label>
          <Select value={reportId} onValueChange={v => { setReportId(v); const r = approvedReports.find(x => x.id == v); if (r) setRepairDesc(r.findings); }}>
            <SelectTrigger><SelectValue placeholder="Select approved report..." /></SelectTrigger>
            <SelectContent>
              {approvedReports.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.plate_number} - {r.vehicle_make_model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {approvedReports.length === 0 && <p className="text-xs text-muted-foreground mt-1">No approved reports available.</p>}
        </div>
        <div>
          <Label>Assigned Mechanic</Label>
          <Input placeholder="Mechanic name" value={mechanic} onChange={e => setMechanic(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Approved Repair Description</Label>
          <Textarea rows={4} value={repairDesc} onChange={e => setRepairDesc(e.target.value)} placeholder="Describe the repair work..." />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create Job Card"}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}