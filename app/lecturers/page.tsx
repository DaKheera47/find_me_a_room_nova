"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";

import { getLecturers } from "@/lib/apiCalls";
import { cn, formatLecturerName } from "@/lib/utils";
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

export default function LecturersPage() {
  const router = useRouter();

  const [lecturers, setLecturers] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLecturers = async (refresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getLecturers(refresh);
      setLecturers(data.lecturers);
      setLastUpdated(data.generatedAt);
    } catch (err) {
      console.error(err);
      setError("Failed to load lecturers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    router.push(`/lecturers/${encodeURIComponent(currentValue)}`);
  };

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Lecturer Search</h1>
        <p className="text-muted-foreground">
          Browse the aggregated timetable and select a lecturer to view their
          current teaching schedule.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Find a Lecturer</CardTitle>
            <CardDescription>
              Start typing a name to filter the list. Selecting a lecturer opens
              their timetable.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh lecturer list"
            onClick={() => fetchLecturers(true)}
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
                  ? formatLecturerName(value) || value
                  : isLoading
                    ? "Loading lecturers..."
                    : "Select lecturer..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <Command
                className="max-h-72 overflow-hidden"
                filter={(value, search) => {
                  console.log({ value, search });
                  const normalizedSearch = search.trim().toLowerCase();
                  if (!normalizedSearch.length) return 1;

                  const normalizedValue = value.toLowerCase();

                  return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                }}
              >
                <CommandInput placeholder="Search lecturers..." />
                <CommandList>
                  <CommandEmpty>No lecturer found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {lecturers.map((lecturer) => (
                      <CommandItem
                        key={lecturer}
                        value={formatLecturerName(lecturer) || lecturer}
                        onSelect={handleSelect}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            value === lecturer ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {formatLecturerName(lecturer) || lecturer}
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
        </CardContent>
      </Card>
    </section>
  );
}
