"use client";

import { useMemo } from "react";
import { MapPin, Users } from "lucide-react";

import { cleanModuleName, dateStringToReadable } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CalendarForTimetable from "@/components/CalendarForTimetable";
import { TimetableEntry } from "@/types/timetableEntry";

type ScheduleDisplayProps = {
  sessions: TimetableEntry[];
  variant: "lecturer" | "module";
  generatedAt?: string;
};

export function ScheduleDisplay({
  sessions,
  variant,
  generatedAt,
}: ScheduleDisplayProps) {
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      const start = new Date(session.startDateString);
      return start >= now;
    });
  }, [sessions]);

  const sessionsByType = useMemo(() => {
    const grouped = new Map<string, TimetableEntry[]>();
    for (const session of upcomingSessions) {
      const type = session.group || "Other";
      const existing = grouped.get(type) || [];
      existing.push(session);
      grouped.set(type, existing);
    }
    return grouped;
  }, [upcomingSessions]);

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No sessions found</CardTitle>
          <CardDescription>
            {variant === "lecturer"
              ? "This lecturer does not have any scheduled sessions in the captured timetables."
              : "This module does not have any scheduled sessions in the captured timetables."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            {variant === "module"
              ? "Sessions scheduled from now onwards, grouped by type."
              : "Showing sessions with a start time later than now."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {upcomingSessions.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No upcoming sessions scheduled.
            </p>
          )}

          {variant === "module" ? (
            // Module: grouped by type
            Array.from(sessionsByType.entries()).map(([type, typeSessions]) => (
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
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <MapPin className="size-3" />
                            <span>{session.roomName}</span>
                          </div>
                          {session.lecturer && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                    <p className="text-muted-foreground text-sm">
                      +{typeSessions.length - 5} more {type.toLowerCase()}{" "}
                      sessions
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Lecturer: simple list
            <>
              {upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.startDateString + "-" + session.module}>
                  <p className="font-medium">
                    {cleanModuleName(session.module)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {session.roomName} • {session.group}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {dateStringToReadable(session.startDateString)} –{" "}
                    {dateStringToReadable(session.endDateString)}
                  </p>
                  <Separator className="my-3" />
                </div>
              ))}
              {upcomingSessions.length > 5 && (
                <p className="text-muted-foreground text-sm">
                  +{upcomingSessions.length - 5} more sessions
                </p>
              )}
            </>
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
        <CardContent className="pt-0 px-6 pb-6">
          <CalendarForTimetable timetable={sessions} />
        </CardContent>
      </Card>
    </div>
  );
}
