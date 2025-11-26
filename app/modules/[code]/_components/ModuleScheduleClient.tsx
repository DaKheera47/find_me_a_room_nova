"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, MapPin, Clock, Calendar } from "lucide-react";

import CalendarForTimetable from "@/components/CalendarForTimetable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getModuleSchedule } from "@/lib/apiCalls";
import { cleanModuleName, dateStringToReadable } from "@/lib/utils";
import { ModuleScheduleResponse } from "@/types/module";

type Props = {
  moduleCode: string;
};

export default function ModuleScheduleClient({ moduleCode }: Props) {
  const router = useRouter();
  const [data, setData] = useState<ModuleScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getModuleSchedule(moduleCode);
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Unable to load this module's timetable.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [moduleCode]);

  const sessions = useMemo(() => data?.timetable ?? [], [data]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      const start = new Date(session.startDateString);
      return start >= now;
    });
  }, [sessions]);

  // Group sessions by type (Lecture, Practical, etc.)
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold md:text-4xl">
            {data?.module.code || moduleCode}
          </h1>
          {data?.module.name && (
            <p className="text-xl text-muted-foreground">
              {cleanModuleName(data.module.name)}
            </p>
          )}
          {data?.generatedAt && (
            <p className="text-xs text-muted-foreground">
              Dataset generated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          Loading timetable...
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
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

      {!isLoading && !error && data && sessions.length > 0 && (
        <div className="space-y-6">
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
                      {data.summary.totalSessions}
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
                      {data.summary.lecturers.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Lecturers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {data.summary.sessionTypes.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Session Types
                    </p>
                  </div>
                </div>
              </div>

              {data.summary.lecturers.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Lecturers:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.summary.lecturers.map((lecturer) => (
                      <Badge key={lecturer} variant="outline">
                        {lecturer}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.summary.sessionTypes.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Session Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.summary.sessionTypes.map((type) => (
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

              {Array.from(sessionsByType.entries()).map(([type, typeSessions]) => (
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
                              {dateStringToReadable(session.startDateString)}
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
                        +{typeSessions.length - 5} more {type.toLowerCase()} sessions
                      </p>
                    )}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
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
