"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import { getLecturerSchedule } from "@/lib/apiCalls";
import {
  cleanModuleName,
  dateStringToReadable,
  formatLecturerName,
} from "@/lib/utils";
import { LecturerScheduleResponse } from "@/types/lecturer";

type Props = {
  lecturer: string;
};

export default function LecturerScheduleClient({ lecturer }: Props) {
  const router = useRouter();
  const [data, setData] = useState<LecturerScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getLecturerSchedule(lecturer);
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Unable to load this lecturer's timetable.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [lecturer]);

  const sessions = useMemo(() => data?.timetable ?? [], [data]);

  const displayName = useMemo(() => {
    const formatted = formatLecturerName(lecturer);
    return formatted.length ? formatted : lecturer;
  }, [lecturer]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      const start = new Date(session.startDateString);
      return start >= now;
    });
  }, [sessions]);

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold md:text-4xl">{displayName}</h1>
          <p className="text-muted-foreground">
            Teaching schedule aggregated from the room timetables.
          </p>
          {data?.generatedAt && (
            <p className="text-xs text-muted-foreground">
              Dataset generated: {" "}
              {new Date(data.generatedAt).toLocaleString()}
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
              This lecturer does not have any scheduled sessions in the
              captured timetables.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <div className="space-y-6">
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
                    {dateStringToReadable(session.startDateString)} – {" "}
                    {dateStringToReadable(session.endDateString)}
                  </p>
                  <Separator className="my-3" />
                </div>
              ))}
            </CardContent>
          </Card>

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
