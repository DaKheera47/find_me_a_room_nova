import { cn } from "@/lib/utils";

type ErrorAlertProps = {
  message: string;
  className?: string;
};

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm",
        className
      )}
    >
      {message}
    </div>
  );
}
