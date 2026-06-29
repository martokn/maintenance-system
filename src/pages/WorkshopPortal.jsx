import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import DeptHeader from "@/components/shared/DeptHeader";
import StatCard from "@/components/shared/StatCard";
import JobCardList from "@/components/workshop/JobCardList";
import CreateJobCard from "@/components/workshop/CreateJobCard";
import PartsRequestForm from "@/components/workshop/PartsRequestForm";
import { Button } from "@/components/ui/button";
import { FileText, Package, ClipboardList } from "lucide-react";

export default function WorkshopPortal() {
  const [view, setView] = useState("jobs"); // jobs | create | parts
  const queryClient = useQueryClient();

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobCards"],
    queryFn: () => api.entities.JobCard.list("-created_date"),
  });

  const { data: approvedReports = [] } = useQuery({
    queryKey: ["approvedReports"],
    queryFn: () => api.entities.InspectionReport.filter({ status: "Approved" }),
  });

  const { data: partsRequests = [] } = useQuery({
    queryKey: ["partsRequests"],
    queryFn: () => api.entities.PartsRequest.list("-created_date"),
  });

  const inProgress = jobs.filter(j => j.status === "In Progress").length;
  const awaitingParts = jobs.filter(j => j.status === "Awaiting Parts").length;
  const completed = jobs.filter(j => ["Completed", "Verified"].includes(j.status)).length;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["jobCards"] });
    queryClient.invalidateQueries({ queryKey: ["approvedReports"] });
    queryClient.invalidateQueries({ queryKey: ["partsRequests"] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DeptHeader number={3} title="Maintenance Workshop Portal" color="orange" />
        <div className="p-5">
          <div className="grid grid-cols-4 gap-4 mb-5">
            <StatCard label="Approved Jobs" value={approvedReports.length} color="bg-green-600" />
            <StatCard label="In Progress" value={inProgress} color="bg-orange-500" />
            <StatCard label="Awaiting Parts" value={awaitingParts} color="bg-purple-600" />
            <StatCard label="Completed" value={completed} color="bg-blue-600" />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setView("jobs")} variant={view === "jobs" ? "default" : "outline"} className="gap-2">
              <ClipboardList className="w-4 h-4" /> Job Cards
            </Button>
            <Button onClick={() => setView("create")} variant={view === "create" ? "default" : "outline"} className="gap-2">
              <FileText className="w-4 h-4" /> Create Job Card
            </Button>
            <Button onClick={() => setView("parts")} variant={view === "parts" ? "default" : "outline"} className="gap-2">
              <Package className="w-4 h-4" /> Request Parts
            </Button>
          </div>
        </div>
      </div>

      {view === "jobs" && <JobCardList jobs={jobs} onRefresh={refresh} />}
      {view === "create" && (
        <CreateJobCard
          approvedReports={approvedReports}
          onSuccess={() => { refresh(); setView("jobs"); }}
          onCancel={() => setView("jobs")}
        />
      )}
      {view === "parts" && (
        <PartsRequestForm
          jobs={jobs.filter(j => j.status === "In Progress" || j.status === "Awaiting Parts")}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}