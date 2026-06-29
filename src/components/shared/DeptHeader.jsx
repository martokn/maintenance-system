import React from "react";
import { cn } from "@/lib/utils";

const colorMap = {
  blue: "bg-primary",
  green: "bg-green-600",
  orange: "bg-orange-500",
  purple: "bg-purple-700",
};

export default function DeptHeader({ number, title, color = "blue" }) {
  return (
    <div className={cn("rounded-t-xl px-5 py-3 flex items-center gap-3", colorMap[color])}>
      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
    </div>
  );
}