"use client";

import { BriefcaseIcon, CheckCircle2, PhoneCall, AlertTriangle } from "lucide-react";

interface Props {
  metrics: {
    rolesTargeted: number;
    applicationsSubmitted: number;
    overdueTasks: number;
    networkingCalls: number;
  };
}

const cards = [
  {
    key: "rolesTargeted" as const,
    label: "Roles Tracked",
    icon: BriefcaseIcon,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "applicationsSubmitted" as const,
    label: "Applications Submitted",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "networkingCalls" as const,
    label: "Networking (30d)",
    icon: PhoneCall,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "overdueTasks" as const,
    label: "Overdue Tasks",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export function DashboardMetrics({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`rounded-md p-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{metrics[key]}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
