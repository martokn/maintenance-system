import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import DeptHeader from "@/components/shared/DeptHeader";
import StatCard from "@/components/shared/StatCard";
import PendingPartsRequests from "@/components/stores/PendingPartsRequests";
import StockManagement from "@/components/stores/StockManagement";
import { Button } from "@/components/ui/button";
import { Package, ClipboardList } from "lucide-react";

export default function StoresPortal() {
  const [view, setView] = useState("requests"); // requests | stock
  const queryClient = useQueryClient();

  const { data: partsRequests = [] } = useQuery({
    queryKey: ["storePartsRequests"],
    queryFn: () => api.entities.PartsRequest.list("-created_date"),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["storeInventory"],
    queryFn: () => api.entities.InventoryItem.list(),
  });

  const pending = partsRequests.filter(r => r.status === "Pending").length;
  const issued = partsRequests.filter(r => r.status === "Issued").length;
  const lowStock = inventory.filter(i => i.quantity_in_stock <= i.reorder_level).length;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["storePartsRequests"] });
    queryClient.invalidateQueries({ queryKey: ["storeInventory"] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DeptHeader number={4} title="Inventory / Stores Portal" color="purple" />
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard label="Pending Requests" value={pending} color="bg-orange-500" />
            <StatCard label="Parts Issued Today" value={issued} color="bg-green-600" />
            <StatCard label="Low Stock Items" value={lowStock} color="bg-red-500" />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setView("requests")} variant={view === "requests" ? "default" : "outline"} className="gap-2">
              <ClipboardList className="w-4 h-4" /> Parts Requests
            </Button>
            <Button onClick={() => setView("stock")} variant={view === "stock" ? "default" : "outline"} className="gap-2">
              <Package className="w-4 h-4" /> Stock Management
            </Button>
          </div>
        </div>
      </div>

      {view === "requests" && <PendingPartsRequests requests={partsRequests} inventory={inventory} onRefresh={refresh} />}
      {view === "stock" && <StockManagement inventory={inventory} onRefresh={refresh} />}
    </div>
  );
}