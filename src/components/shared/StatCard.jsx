import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, color = "bg-primary" }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center text-center">
      <span className={cn("text-3xl font-extrabold", {
        "text-primary": color === "bg-primary",
        "text-green-600": color === "bg-green-600",
        "text-orange-500": color === "bg-orange-500",
        "text-red-500": color === "bg-red-500",
        "text-purple-600": color === "bg-purple-600",
        "text-blue-600": color === "bg-blue-600",
      })}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}