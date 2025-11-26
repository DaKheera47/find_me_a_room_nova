"use client";

import { MenuIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCommandBarStore } from "@/store/commandBarStore";
import { siteConfig } from "@/config/site";

import Logo from "@/components/shadcn-studio/logo";

const Navbar = () => {
  const { toggle } = useCommandBarStore();
  const navItems = siteConfig.mainNav;

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex items-center justify-between gap-8 py-4">
        <Link href="/">
          <Logo className="gap-3 text-foreground" />
        </Link>

        <nav className="flex items-center gap-6 font-medium text-muted-foreground lg:gap-10">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm hover:text-primary max-md:hidden"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle}>
            <SearchIcon className="size-5" />
            <span className="sr-only">Search</span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden" asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuGroup>
                {navItems.map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
