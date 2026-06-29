import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export default function NewInspectionForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    vehicle_id: "",
    findings: "",
    recommended_parts: "",
    estimated_cost: "",
    priority: "Medium",
  });
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.entities.Vehicle.list(),
  });

  const selectedVehicle = vehicles.find(v => v.id == form.vehicle_id);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const url = URL.createObjectURL(file);
      setPhotos(prev => [...prev, url]);
    }
  };

  const handleSubmit = async () => {
    if (!form.vehicle_id || !form.findings) {
      toast.error("Please select a vehicle and add findings.");
      return;
    }
    setSaving(true);

    try {
      const user = await api.auth.me();
      const reportNum = `IR-${Date.now().toString().slice(-6)}`;

      await api.entities.InspectionReport.create({
        report_number: reportNum,
        vehicle_id: form.vehicle_id,
        plate_number: selectedVehicle?.plate_number,
        vehicle_make_model: `${selectedVehicle?.make} ${selectedVehicle?.model}`,
        vehicle_department: selectedVehicle?.department,
        inspector_name: user?.full_name || "Inspector",
        inspection_date: new Date().toISOString().split("T")[0],
        findings: form.findings,
        recommended_parts: form.recommended_parts,
        estimated_cost: parseFloat(form.estimated_cost) || 0,
        priority: form.priority,
        photos: photos,
        status: "Awaiting Approval",
      });

      await api.entities.Vehicle.update(form.vehicle_id, { status: "In Maintenance" });

      await api.entities.Notification.create({
        message: `New inspection report ${reportNum} submitted for ${selectedVehicle?.plate_number} - ${selectedVehicle?.make} ${selectedVehicle?.model}`,
        type: "inspection",
        target_department: "Department Approver",
      });

      toast.success("Inspection report submitted!");
      setSaving(false);
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to submit inspection report");
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-5">New Inspection Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Select Vehicle</Label>
          <Select value={form.vehicle_id} onValueChange={v => setForm({ ...form, vehicle_id: v })}>
            <SelectTrigger><SelectValue placeholder="Choose vehicle..." /></SelectTrigger>
            <SelectContent>
              {vehicles.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.plate_number} - {v.make} {v.model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVehicle && (
            <p className="text-xs text-muted-foreground mt-1">Department: {selectedVehicle.department}</p>
          )}
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Low", "Medium", "High", "Critical"].map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Findings</Label>
          <Textarea
            placeholder="Describe inspection findings..."
            value={form.findings}
            onChange={e => setForm({ ...form, findings: e.target.value })}
            rows={4}
          />
        </div>
        <div>
          <Label>Recommended Parts</Label>
          <Input
            placeholder="e.g. Brake Pads, Brake Fluid (2L)"
            value={form.recommended_parts}
            onChange={e => setForm({ ...form, recommended_parts: e.target.value })}
          />
        </div>
        <div>
          <Label>Estimated Cost (KES)</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.estimated_cost}
            onChange={e => setForm({ ...form, estimated_cost: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {photos.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Submitting..." : "Submit Report"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}