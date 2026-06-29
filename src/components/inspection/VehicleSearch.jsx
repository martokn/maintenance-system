import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VehicleSearch() {
  const [query, setQuery] = useState("");
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.entities.Vehicle.list(),
  });

  const filtered = vehicles.filter(v =>
    v.plate_number?.toLowerCase().includes(query.toLowerCase()) ||
    v.make?.toLowerCase().includes(query.toLowerCase()) ||
    v.model?.toLowerCase().includes(query.toLowerCase())
  );

  const statusColors = {
    Active: "bg-green-100 text-green-700",
    "In Maintenance": "bg-orange-100 text-orange-700",
    Grounded: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Vehicle Search</h3>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by plate number, make, or model..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Plate No.</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Make</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Model</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Department</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-2.5 px-3 font-semibold">{v.plate_number}</td>
                <td className="py-2.5 px-3">{v.make}</td>
                <td className="py-2.5 px-3">{v.model}</td>
                <td className="py-2.5 px-3">{v.department}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="secondary" className={statusColors[v.status]}>{v.status}</Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No vehicles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}