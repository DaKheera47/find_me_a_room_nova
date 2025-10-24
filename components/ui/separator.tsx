import * as React from "react";

import { cn } from "@/lib/utils";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-border", className)}
      {...props}
    />
  ),
);

Separator.displayName = "Separator";
