import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function PartsRequestForm({ jobs, onSuccess }) {
  const [jobId, setJobId] = useState("");
  const [items, setItems] = useState([{ part_name: "", quantity: 1, status: "Requested" }]);
  const [saving, setSaving] = useState(false);

  const selectedJob = jobs.find(j => j.id == jobId);

  const addItem = () => setItems([...items, { part_name: "", quantity: 1, status: "Requested" }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!jobId || items.some(i => !i.part_name)) {
      toast.error("Select a job and add part names.");
      return;
    }
    setSaving(true);

    try {
      const user = await api.auth.me();
      const reqNum = `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;

      await api.entities.PartsRequest.create({
        request_number: reqNum,
        job_card_id: jobId,
        job_number: selectedJob?.job_number || "",
        requested_by: user?.full_name || "Workshop",
        request_date: new Date().toISOString().split("T")[0],
        items: items,
        status: "Pending",
      });

      await api.entities.JobCard.update(jobId, { status: "Awaiting Parts" });

      await api.entities.Notification.create({
        message: `Parts request ${reqNum} from Workshop for Job ${selectedJob?.job_number}`,
        type: "parts",
        target_department: "Stores",
      });

      toast.success("Parts request submitted!");
      setSaving(false);
      setJobId("");
      setItems([{ part_name: "", quantity: 1, status: "Requested" }]);
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to submit parts request");
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-5">Request Parts</h3>
      <div className="space-y-5">
        <div>
          <Label>Job Card</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger><SelectValue placeholder="Select job card..." /></SelectTrigger>
            <SelectContent>
              {jobs.map(j => (
                <SelectItem key={j.id} value={j.id}>{j.job_number} - {j.plate_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Parts List</Label>
            <Button size="sm" variant="outline" onClick={addItem} className="gap-1 text-xs">
              <Plus className="w-3 h-3" /> Add Part
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input placeholder="Part name" value={item.part_name} onChange={e => updateItem(i, "part_name", e.target.value)} />
                </div>
                <div className="w-24">
                  <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                </div>
                {items.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => removeItem(i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={saving}>{saving ? "Submitting..." : "Submit Parts Request"}</Button>
      </div>
    </div>
  );
}