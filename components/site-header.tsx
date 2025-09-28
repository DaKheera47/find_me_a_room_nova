"use client";

import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useCommandBarStore } from "@/store/commandBarStore";
import { Search, User } from "lucide-react";

export function SiteHeader() {
  const { toggle } = useCommandBarStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <div
              onClick={toggle}
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Search className="size-5" />
              <span className="sr-only">Search</span>
            </div>

            <Link
              href={siteConfig.links.author}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <User className="size-5" />
                <span className="sr-only">Author</span>
              </div>
            </Link>

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
