"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, RefreshCw, BookOpen } from "lucide-react";

import { getModules } from "@/lib/apiCalls";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ModuleInfo } from "@/types/module";

export default function ModulesPage() {
  const router = useRouter();

  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchModules = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getModules();
      setModules(data.modules);
      setLastUpdated(data.generatedAt);
    } catch (err) {
      console.error(err);
      setError("Failed to load modules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSelect = (moduleCode: string) => {
    setValue(moduleCode);
    setOpen(false);
    router.push(`/modules/${encodeURIComponent(moduleCode)}`);
  };

  const formatModuleDisplay = (module: ModuleInfo) => {
    return `${module.code} - ${module.name}`;
  };

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Module Search</h1>
        <p className="text-muted-foreground">
          Search for a module by code or name to view all scheduled sessions
          across all rooms and lecturers.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Find a Module
            </CardTitle>
            <CardDescription>
              Start typing a module code (e.g., CO3519) or name to filter the
              list. Selecting a module shows all its sessions.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh module list"
            onClick={() => fetchModules()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={isLoading || error !== null}
              >
                {value
                  ? modules.find((m) => m.code === value)
                    ? formatModuleDisplay(modules.find((m) => m.code === value)!)
                    : value
                  : isLoading
                    ? "Loading modules..."
                    : "Select module..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command
                className="max-h-72 overflow-hidden"
                filter={(value, search) => {
                  const normalizedSearch = search.trim().toLowerCase();
                  if (!normalizedSearch.length) return 1;

                  const normalizedValue = value.toLowerCase();
                  return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                }}
              >
                <CommandInput placeholder="Search by code or name..." />
                <CommandList>
                  <CommandEmpty>No module found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {modules.map((module) => (
                      <CommandItem
                        key={module.code}
                        value={formatModuleDisplay(module)}
                        onSelect={() => handleSelect(module.code)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "size-4 shrink-0",
                              value === module.code ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{module.code}</span>
                            <span className="line-clamp-1 text-sm text-muted-foreground">
                              {module.name}
                            </span>
                          </div>
                        </div>
                        {module.eventCount && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {module.eventCount} sessions
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}

          {!isLoading && !error && modules.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {modules.length} modules available
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
