"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, RefreshCw, X } from "lucide-react";

import { getLecturers, getLecturerSchedule } from "@/lib/apiCalls";
import {
  cn,
  formatLecturerName,
  cleanModuleName,
  dateStringToReadable,
} from "@/lib/utils";
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
import { Separator } from "@/components/ui/separator";
import CalendarForTimetable from "@/components/CalendarForTimetable";
import { LecturerScheduleResponse } from "@/types/lecturer";

function LecturersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get("name");

  // Lecturer list state
  const [lecturers, setLecturers] = useState<string[]>([]);
  const [listLastUpdated, setListLastUpdated] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState(nameFromUrl || "");
  const [listError, setListError] = useState<string | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);

  // Lecturer schedule state
  const [scheduleData, setScheduleData] =
    useState<LecturerScheduleResponse | null>(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fetch lecturer list
  const fetchLecturers = async (refresh = false) => {
    setIsListLoading(true);
    setListError(null);

    try {
      const data = await getLecturers(refresh);
      setLecturers(data.lecturers);
      setListLastUpdated(data.generatedAt);
    } catch (err) {
      console.error(err);
      setListError("Failed to load lecturers. Please try again.");
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch schedule for selected lecturer
  const fetchSchedule = async (name: string) => {
    if (!name) {
      setScheduleData(null);
      return;
    }

    setIsScheduleLoading(true);
    setScheduleError(null);

    try {
      const response = await getLecturerSchedule(name);
      setScheduleData(response);
    } catch (err) {
      console.error(err);
      setScheduleError("Unable to load this lecturer's timetable.");
    } finally {
      setIsScheduleLoading(false);
    }
  };

  // Load lecturer list on mount
  useEffect(() => {
    fetchLecturers();
  }, []);

  // Sync selected name from URL on mount and URL changes
  useEffect(() => {
    if (nameFromUrl && nameFromUrl !== selectedName) {
      setSelectedName(nameFromUrl);
    }
  }, [nameFromUrl]);

  // Fetch schedule when selected name changes
  useEffect(() => {
    if (selectedName) {
      fetchSchedule(selectedName);
    } else {
      setScheduleData(null);
    }
  }, [selectedName]);

  const handleSelect = (currentValue: string) => {
    setSelectedName(currentValue);
    setOpen(false);
    router.push(`/lecturers?name=${encodeURIComponent(currentValue)}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    setSelectedName("");
    setScheduleData(null);
    router.push("/lecturers", { scroll: false });
  };

  const displayName = useMemo(() => {
    const formatted = formatLecturerName(selectedName);
    return formatted.length ? formatted : selectedName;
  }, [selectedName]);

  const sessions = useMemo(() => scheduleData?.timetable ?? [], [scheduleData]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      const start = new Date(session.startDateString);
      return start >= now;
    });
  }, [sessions]);

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Lecturer Search</h1>
        <p className="text-muted-foreground">
          Browse the aggregated timetable and select a lecturer to view their
          current teaching schedule.
        </p>
      </div>

      {/* Search Card */}
      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Find a Lecturer</CardTitle>
            <CardDescription>
              Start typing a name to filter the list.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh lecturer list"
            onClick={() => fetchLecturers(true)}
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
                  {selectedName
                    ? displayName
                    : isListLoading
                      ? "Loading lecturers..."
                      : "Select lecturer..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0">
                <Command
                  className="max-h-72 overflow-hidden"
                  filter={(value, search) => {
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
                              selectedName === lecturer
                                ? "opacity-100"
                                : "opacity-0"
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

            {selectedName && (
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
        selectedName &&
        sessions.length === 0 &&
        scheduleData && (
          <Card>
            <CardHeader>
              <CardTitle>No sessions found</CardTitle>
              <CardDescription>
                This lecturer does not have any scheduled sessions in the
                captured timetables.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

      {!isScheduleLoading &&
        !scheduleError &&
        scheduleData &&
        sessions.length > 0 && (
          <div className="space-y-6">
            {/* Lecturer Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-muted-foreground">
                Teaching schedule aggregated from the room timetables.
              </p>
              {scheduleData.generatedAt && (
                <p className="text-xs text-muted-foreground">
                  Dataset generated:{" "}
                  {new Date(scheduleData.generatedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Showing sessions with a start time later than now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No upcoming sessions scheduled.
                  </p>
                )}

                {upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session.startDateString + "-" + session.module}>
                    <p className="font-medium">
                      {cleanModuleName(session.module)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.roomName} • {session.group}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dateStringToReadable(session.startDateString)} –{" "}
                      {dateStringToReadable(session.endDateString)}
                    </p>
                    <Separator className="my-3" />
                  </div>
                ))}

                {upcomingSessions.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{upcomingSessions.length - 5} more sessions
                  </p>
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

export default function LecturersPage() {
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
      <LecturersPageContent />
    </Suspense>
  );
}
