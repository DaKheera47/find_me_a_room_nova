import Link from "next/link";

import { cn } from "@/lib/utils";
import { NavItem } from "@/types/nav";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <>
      {items?.length ? (
        <nav className="flex gap-4 md:gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-black hover:dark:text-white md:text-sm",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </Link>
              ),
          )}
        </nav>
      ) : null}
    </>
  );
}
