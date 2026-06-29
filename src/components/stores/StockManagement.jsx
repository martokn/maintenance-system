import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = ["Brakes", "Engine", "Electrical", "Body", "Suspension", "Fluids", "Filters", "Tyres", "Other"];
const units = ["Pieces", "Litres", "Sets", "Metres", "Kg"];

export default function StockManagement({ inventory, onRefresh }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    part_name: "", part_number: "", category: "Other", quantity_in_stock: 0,
    unit: "Pieces", reorder_level: 5, unit_cost: 0, location: "",
  });

  const filtered = inventory.filter(i =>
    i.part_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.part_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newItem.part_name) { toast.error("Part name is required."); return; }
    try {
      await api.entities.InventoryItem.create(newItem);
      toast.success("Stock item added!");
      setOpen(false);
      setNewItem({ part_name: "", part_number: "", category: "Other", quantity_in_stock: 0, unit: "Pieces", reorder_level: 5, unit_cost: 0, location: "" });
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to add stock item");
    }
  };

  const handleReceive = async (item) => {
    const qty = prompt("Enter quantity to receive:");
    if (!qty || isNaN(qty)) return;
    try {
      await api.entities.InventoryItem.update(item.id, {
        quantity_in_stock: (item.quantity_in_stock || 0) + parseInt(qty),
      });
      toast.success(`Received ${qty} ${item.unit || "units"} of ${item.part_name}`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to receive stock");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider">Stock Management</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-56" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Stock Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Part Name</Label><Input value={newItem.part_name} onChange={e => setNewItem({ ...newItem, part_name: e.target.value })} /></div>
                <div><Label>Part Number</Label><Input value={newItem.part_number} onChange={e => setNewItem({ ...newItem, part_number: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={newItem.category} onValueChange={v => setNewItem({ ...newItem, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={newItem.unit} onValueChange={v => setNewItem({ ...newItem, unit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Quantity</Label><Input type="number" value={newItem.quantity_in_stock} onChange={e => setNewItem({ ...newItem, quantity_in_stock: parseInt(e.target.value) || 0 })} /></div>
                  <div><Label>Reorder Level</Label><Input type="number" value={newItem.reorder_level} onChange={e => setNewItem({ ...newItem, reorder_level: parseInt(e.target.value) || 0 })} /></div>
                  <div><Label>Unit Cost</Label><Input type="number" value={newItem.unit_cost} onChange={e => setNewItem({ ...newItem, unit_cost: parseFloat(e.target.value) || 0 })} /></div>
                </div>
                <div><Label>Location</Label><Input value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} placeholder="e.g. Shelf A-3" /></div>
                <Button onClick={handleAdd} className="w-full">Add Stock Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Part Name</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Part No.</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Category</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">In Stock</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Reorder</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              const isLow = i.quantity_in_stock <= i.reorder_level;
              return (
                <tr key={i.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-semibold">{i.part_name}</td>
                  <td className="py-2.5 px-3">{i.part_number || "-"}</td>
                  <td className="py-2.5 px-3">{i.category}</td>
                  <td className="py-2.5 px-3 font-semibold">{i.quantity_in_stock} {i.unit}</td>
                  <td className="py-2.5 px-3">{i.reorder_level}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="secondary" className={isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                      {isLow ? "Low Stock" : "In Stock"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Button size="sm" variant="outline" onClick={() => handleReceive(i)} className="text-xs">
                      Receive
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No inventory items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}