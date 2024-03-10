import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function CustomKBD({ children }: Props) {
  return (
    <kbd className="rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-xs font-semibold text-neutral-800 dark:border-neutral-500 dark:bg-neutral-600 dark:text-neutral-100">
      {children}
    </kbd>
  );
}
