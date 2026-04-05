import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "blue" | "green" | "amber" | "purple" | "red";
}

const iconVariants: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  purple: "bg-purple-100 text-purple-600",
  red: "bg-red-100 text-red-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatCardProps) {
  const hasDescription =
    typeof description === "string" && description.trim().length > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={cn("p-2 rounded-lg", iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {hasDescription && (
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      )}
    </div>
  );
}
