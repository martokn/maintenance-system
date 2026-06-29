import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Package } from "lucide-react";

export default function PendingPartsRequests({ requests, inventory, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);

  const pendingReqs = requests.filter(r => r.status === "Pending");

  const handleIssue = async () => {
    if (!selected) return;
    setProcessing(true);

    try {
      const user = await api.auth.me();
      const voucherNum = `IV-${Date.now().toString().slice(-6)}`;

      for (const item of selected.items || []) {
        const stockItem = inventory.find(i =>
          i.part_name?.toLowerCase() === item.part_name?.toLowerCase()
        );
        if (stockItem) {
          const newQty = Math.max(0, (stockItem.quantity_in_stock || 0) - (item.quantity || 0));
          await api.entities.InventoryItem.update(stockItem.id, { quantity_in_stock: newQty });
        }
      }

      const updatedItems = (selected.items || []).map(i => ({ ...i, status: "Issued" }));
      await api.entities.PartsRequest.update(selected.id, {
        status: "Issued",
        approved_by: user?.full_name || "Stores",
        issue_date: new Date().toISOString().split("T")[0],
        voucher_number: voucherNum,
        items: updatedItems,
      });

      if (selected.job_card_id) {
        await api.entities.JobCard.update(selected.job_card_id, { status: "In Progress" });
      }

      await api.entities.Notification.create({
        message: `Parts issued (Voucher: ${voucherNum}) for Job ${selected.job_number}. Stock deducted.`,
        type: "parts",
        target_department: "Workshop",
      });

      toast.success("Parts issued and stock deducted!");
      setSelected(null);
      setProcessing(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to issue parts");
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setProcessing(true);

    try {
      await api.entities.PartsRequest.update(selected.id, { status: "Rejected" });
      toast.success("Request rejected.");
      setSelected(null);
      setProcessing(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to reject request");
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider">Pending Parts Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Request No.</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">From</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Job No.</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingReqs.map(r => (
                <tr
                  key={r.id}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${selected?.id === r.id ? "bg-primary/5" : "hover:bg-muted/50"}`}
                  onClick={() => setSelected(r)}
                >
                  <td className="py-2.5 px-3 font-semibold">{r.request_number}</td>
                  <td className="py-2.5 px-3">{r.requested_by}</td>
                  <td className="py-2.5 px-3">{r.job_number}</td>
                  <td className="py-2.5 px-3">{r.request_date ? format(new Date(r.request_date), "dd/MM/yyyy") : "-"}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">{r.status}</Badge>
                  </td>
                </tr>
              ))}
              {pendingReqs.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No pending requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        {selected ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Request Details: {selected.request_number}</h3>
            <div className="text-sm space-y-2">
              <p><span className="text-muted-foreground">Requested By:</span> {selected.requested_by}</p>
              <p><span className="text-muted-foreground">Job No.:</span> {selected.job_number}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Requested Parts:</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left py-1.5 px-3 text-xs">Part Name</th>
                    <th className="text-left py-1.5 px-3 text-xs">Quantity</th>
                    <th className="text-left py-1.5 px-3 text-xs">Available Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items || []).map((item, i) => {
                    const stock = inventory.find(s => s.part_name?.toLowerCase() === item.part_name?.toLowerCase());
                    return (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-1.5 px-3">{item.part_name}</td>
                        <td className="py-1.5 px-3">{item.quantity}</td>
                        <td className="py-1.5 px-3 font-semibold">{stock?.quantity_in_stock ?? "N/A"}{stock?.unit ? ` ${stock.unit}` : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleIssue} disabled={processing} className="bg-green-600 hover:bg-green-700 gap-2">
                <Check className="w-4 h-4" /> Approve & Issue
              </Button>
              <Button onClick={handleReject} disabled={processing} variant="destructive" className="gap-2">
                <X className="w-4 h-4" /> Reject
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            <Package className="w-5 h-5 mr-2" /> Select a request to review
          </div>
        )}
      </div>
    </div>
  );
}