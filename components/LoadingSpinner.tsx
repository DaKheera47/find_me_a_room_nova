import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  message?: string;
  className?: string;
};

export function LoadingSpinner({
  message = "Loading...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-muted-foreground text-sm",
        className
      )}
    >
      <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
      {message}
    </div>
  );
}
