"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Module {
  moduleCode: string;
}

interface ModuleBadgeListProps {
  title: string;
  modules: Module[];
  onRemove?: (moduleCode: string) => void;
}

export function ModuleBadgeList({
  title,
  modules,
  onRemove,
}: ModuleBadgeListProps) {
  if (modules.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 flex items-start lg:items-center gap-4 lg:flex-row flex-col">
      <h4 className="text-sm font-semibold">
        {title} ({modules.length})
      </h4>

      <div className="flex flex-wrap gap-2">
        {modules.map((m) => (
          <Badge
            key={m.moduleCode}
            variant="outline"
            className={onRemove ? "cursor-pointer" : undefined}
            onClick={onRemove ? () => onRemove(m.moduleCode) : undefined}
          >
            {!onRemove && <Check className="mr-1 size-3" />}
            {m.moduleCode}
            {onRemove && <span className="ml-1 text-destructive">×</span>}
          </Badge>
        ))}
      </div>
    </div>
  );
}
