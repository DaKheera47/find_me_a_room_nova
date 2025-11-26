"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  RefreshCw,
  BookOpen,
  Users,
  MapPin,
  Clock,
  Calendar,
  X,
} from "lucide-react";

import { getModules, getModuleSchedule } from "@/lib/apiCalls";
import { cn, cleanModuleName, dateStringToReadable } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CalendarForTimetable from "@/components/CalendarForTimetable";
import { ModuleInfo, ModuleScheduleResponse } from "@/types/module";

function ModulesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  // Module list state
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [listLastUpdated, setListLastUpdated] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(codeFromUrl || "");
  const [listError, setListError] = useState<string | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);

  // Module schedule state
  const [scheduleData, setScheduleData] =
    useState<ModuleScheduleResponse | null>(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fetch module list
  const fetchModules = async () => {
    setIsListLoading(true);
    setListError(null);

    try {
      const data = await getModules();
      setModules(data.modules);
      setListLastUpdated(data.generatedAt);
    } catch (err) {
      console.error(err);
      setListError("Failed to load modules. Please try again.");
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch schedule for selected module
  const fetchSchedule = async (code: string) => {
    if (!code) {
      setScheduleData(null);
      return;
    }

    setIsScheduleLoading(true);
    setScheduleError(null);

    try {
      const response = await getModuleSchedule(code);
      setScheduleData(response);
    } catch (err) {
      console.error(err);
      setScheduleError("Unable to load this module's timetable.");
    } finally {
      setIsScheduleLoading(false);
    }
  };

  // Load module list on mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Sync selected code from URL on mount and URL changes
  useEffect(() => {
    if (codeFromUrl && codeFromUrl !== selectedCode) {
      setSelectedCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  // Fetch schedule when selected code changes
  useEffect(() => {
    if (selectedCode) {
      fetchSchedule(selectedCode);
    } else {
      setScheduleData(null);
    }
  }, [selectedCode]);

  const handleSelect = (moduleCode: string) => {
    setSelectedCode(moduleCode);
    setOpen(false);
    router.push(`/modules?code=${encodeURIComponent(moduleCode)}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    setSelectedCode("");
    setScheduleData(null);
    router.push("/modules", { scroll: false });
  };

  const formatModuleDisplay = (module: ModuleInfo) => {
    return `${module.code} - ${cleanModuleName(module.name)}`;
  };

  const selectedModule = useMemo(
    () => modules.find((m) => m.code === selectedCode),
    [modules, selectedCode]
  );

  const sessions = useMemo(() => scheduleData?.timetable ?? [], [scheduleData]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      const start = new Date(session.startDateString);
      return start >= now;
    });
  }, [sessions]);

  const sessionsByType = useMemo(() => {
    const grouped = new Map<string, typeof sessions>();
    for (const session of upcomingSessions) {
      const type = session.group || "Other";
      const existing = grouped.get(type) || [];
      existing.push(session);
      grouped.set(type, existing);
    }
    return grouped;
  }, [upcomingSessions]);

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Module Search</h1>
        <p className="text-muted-foreground">
          Search for a module by code or name to view all scheduled sessions
          across all rooms and lecturers.
        </p>
      </div>

      {/* Search Card */}
      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Find a Module
            </CardTitle>
            <CardDescription>
              Start typing a module code (e.g., CO3519) or name to filter the
              list.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh module list"
            onClick={() => fetchModules()}
            disabled={isListLoading}
          >
            <RefreshCw
              className={cn("size-4", isListLoading && "animate-spin")}
            />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isListLoading || listError !== null}
                >
                  {selectedModule
                    ? formatModuleDisplay(selectedModule)
                    : selectedCode
                      ? selectedCode
                      : isListLoading
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
                                selectedCode === module.code
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{module.code}</span>
                              <span className="line-clamp-1 text-sm text-muted-foreground">
                                {cleanModuleName(module.name)}
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

            {selectedCode && (
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="size-4" />
              </Button>
            )}
          </div>

          {listError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {listError}
            </div>
          )}

          {listLastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(listLastUpdated).toLocaleString()}
            </p>
          )}

          {!isListLoading && !listError && modules.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {modules.length} modules available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Schedule Content */}
      {scheduleError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {scheduleError}
        </div>
      )}

      {isScheduleLoading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          Loading timetable...
        </div>
      )}

      {!isScheduleLoading &&
        !scheduleError &&
        selectedCode &&
        sessions.length === 0 &&
        scheduleData && (
          <Card>
            <CardHeader>
              <CardTitle>No sessions found</CardTitle>
              <CardDescription>
                This module does not have any scheduled sessions in the captured
                timetables.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

      {!isScheduleLoading &&
        !scheduleError &&
        scheduleData &&
        sessions.length > 0 && (
          <div className="space-y-6">
            {/* Module Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{scheduleData.module.code}</h2>
              <p className="text-lg text-muted-foreground">
                {cleanModuleName(scheduleData.module.name)}
              </p>
              {scheduleData.generatedAt && (
                <p className="text-xs text-muted-foreground">
                  Dataset generated:{" "}
                  {new Date(scheduleData.generatedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Module Summary</CardTitle>
                <CardDescription>
                  Overview of all scheduled sessions for this module.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {scheduleData.summary.totalSessions}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {scheduleData.summary.lecturers.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Lecturers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {scheduleData.summary.sessionTypes.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Session Types
                      </p>
                    </div>
                  </div>
                </div>

                {scheduleData.summary.lecturers.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Lecturers:</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduleData.summary.lecturers.map((lecturer) => (
                        <Badge key={lecturer} variant="outline">
                          {lecturer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleData.summary.sessionTypes.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Session Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduleData.summary.sessionTypes.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Sessions by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Sessions scheduled from now onwards, grouped by type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {upcomingSessions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No upcoming sessions scheduled.
                  </p>
                )}

                {Array.from(sessionsByType.entries()).map(
                  ([type, typeSessions]) => (
                    <div key={type}>
                      <h3 className="mb-3 font-semibold">{type}</h3>
                      <div className="space-y-3">
                        {typeSessions.slice(0, 5).map((session, idx) => (
                          <div
                            key={`${session.startDateString}-${session.roomName}-${idx}`}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {dateStringToReadable(
                                    session.startDateString
                                  )}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="size-3" />
                                  <span>{session.roomName}</span>
                                </div>
                                {session.lecturer && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="size-3" />
                                    <span>{session.lecturer}</span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {session.time}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {typeSessions.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            +{typeSessions.length - 5} more{" "}
                            {type.toLowerCase()} sessions
                          </p>
                        )}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly View</CardTitle>
                <CardDescription>
                  Explore the full schedule in calendar form.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CalendarForTimetable timetable={sessions} />
              </CardContent>
            </Card>
          </div>
        )}
    </section>
  );
}

export default function ModulesPage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            Loading...
          </div>
        </section>
      }
    >
      <ModulesPageContent />
    </Suspense>
  );
}
