import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import DeptHeader from "@/components/shared/DeptHeader";
import StatCard from "@/components/shared/StatCard";
import NewInspectionForm from "@/components/inspection/NewInspectionForm";
import InspectionTable from "@/components/inspection/InspectionTable";
import VehicleSearch from "@/components/inspection/VehicleSearch";
import FinalInspection from "@/components/inspection/FinalInspection";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, CheckCircle } from "lucide-react";

export default function InspectionPortal() {
  const [view, setView] = useState("list"); // list | new | search | verify
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["inspectionReports"],
    queryFn: () => api.entities.InspectionReport.list("-created_date"),
  });

  const pending = reports.filter(r => r.status === "Awaiting Approval").length;
  const approved = reports.filter(r => r.status === "Approved").length;
  const completed = reports.filter(r => ["Completed", "Verified"].includes(r.status)).length;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DeptHeader number={1} title="Inspection Department Portal" color="blue" />
        <div className="p-5">
          <div className="grid grid-cols-4 gap-4 mb-5">
            <StatCard label="Pending Inspections" value={pending} color="bg-primary" />
            <StatCard label="Awaiting Approval" value={approved} color="bg-orange-500" />
            <StatCard label="Completed" value={completed} color="bg-green-600" />
            <StatCard label="Active Vehicles" value={reports.filter(r => r.status === "Verified").length} color="bg-blue-600" />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setView("new")} className="gap-2">
              <Plus className="w-4 h-4" /> New Inspection
            </Button>
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")} className="gap-2">
              <FileText className="w-4 h-4" /> View Reports
            </Button>
            <Button variant={view === "verify" ? "default" : "outline"} onClick={() => setView("verify")} className="gap-2">
              <CheckCircle className="w-4 h-4" /> Final Inspection
            </Button>
            <Button variant="outline" onClick={() => setView("search")} className="gap-2">
              <Search className="w-4 h-4" /> Vehicle Search
            </Button>
          </div>
        </div>
      </div>

      {view === "new" && (
        <NewInspectionForm 
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ["inspectionReports"] }); setView("list"); }}
          onCancel={() => setView("list")}
        />
      )}

      {view === "search" && <VehicleSearch />}

      {view === "verify" && <FinalInspection />}

      {view === "list" && <InspectionTable reports={reports} isLoading={isLoading} />}
    </div>
  );
}