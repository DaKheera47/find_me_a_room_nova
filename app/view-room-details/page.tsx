"use client";

import CalendarForTimetable from "@/components/CalendarForTimetable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listOfRooms } from "@/content/listOfRooms";
import { getRoomData } from "@/lib/apiCalls";
import { cleanModuleName, cn, dateStringToReadable } from "@/lib/utils";
import { RoomData } from "@/types/roomData";
import {
  format,
  formatDistanceToNow,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function SearchBar() {
  const searchParams = useSearchParams();

  const roomName = searchParams.get("room")?.toUpperCase();
  const [data, setData] = useState<RoomData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      if (!roomName) {
        setError("No room name provided");
        return;
      }

      if (!listOfRooms.includes(roomName)) {
        setError("Invalid room name");
        return;
      }

      if (roomName) {
        // Do something with the room name
        setIsLoading(true);
        setData(await getRoomData(roomName));
        setIsLoading(false);
      }
    }

    fetch();
  }, [roomName]);

  return (
    <Suspense>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-bold md:text-4xl">
            UCLan {roomName || "Room"} Time Table
            <br className="block" />
            <span className="from mt-2 w-fit bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-xl font-extrabold text-transparent">
              Detailed information about {roomName || "a room"}
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
            Explore detailed information about {roomName || "a room"} on the
            University of Central Lancashire Preston campus.
          </p>
        </div>

        {error && (
          <div
            className="mb-4 w-fit rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-200"
            role="alert"
          >
            <p className="font-bold">{error}</p>

            <p>
              Please enter a valid room name, or press{" "}
              <kbd className="rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-xs font-semibold text-neutral-800 dark:border-neutral-500 dark:bg-neutral-600 dark:text-neutral-100">
                cmd + k
              </kbd>{" "}
              to search for a room.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "mb-6 size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
                !isLoading && "invisible",
              )}
            />
          </div>
        )}

        <div>
          {data && (
            <Card className="w-full md:w-2/3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Room Summary</CardTitle>
                  <CardDescription>Summary for {data.roomName}</CardDescription>
                </div>

                <div
                  className={cn(
                    "mb-6 size-8 rounded-full",
                    data.isFree ? "bg-green-500" : "bg-red-500",
                  )}
                />
              </CardHeader>

              <CardContent>
                <p>
                  {data.roomName} is{" "}
                  {data.isFree ? "available" : "not available"} at{" "}
                  {dateStringToReadable(data.dateBeingChecked)}.
                </p>

                <div>
                  {data.timetable?.map((event) => {
                    const startDate = event.startDateString;
                    const endDate = event.endDateString;
                    const currDate = new Date();

                    if (!startDate || !endDate) {
                      return null;
                    }

                    if (
                      isWithinInterval(currDate, {
                        start: new Date(startDate),
                        end: new Date(endDate),
                      })
                    ) {
                      return (
                        <div key={event.module} className="mt-4 space-y-4">
                          <div>
                            <span>
                              <span className="font-bold">
                                {cleanModuleName(event.module)}
                              </span>{" "}
                              from {format(parseISO(startDate), "h:mma")} to{" "}
                              {format(parseISO(endDate), "h:mma")} by{" "}
                              <span className="font-bold">
                                {event.lecturer}
                              </span>
                              .
                            </span>
                          </div>

                          <div>
                            <span>Ends in: {formatDistanceToNow(endDate)}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <CalendarForTimetable timetable={data?.timetable} />
      </section>
    </Suspense>
  );
}
