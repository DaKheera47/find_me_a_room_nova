"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DoorOpen } from "lucide-react";
import {
  format,
  formatDistanceToNow,
  isWithinInterval,
  parseISO,
} from "date-fns";

import { listOfRooms } from "@/content/listOfRooms";
import { getRoomData } from "@/lib/apiCalls";
import { cleanModuleName, cn, dateStringToReadable } from "@/lib/utils";
import { RoomData } from "@/types/roomData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SearchableCombobox,
  ComboboxItem,
} from "@/components/SearchableCombobox";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import CalendarForTimetable from "@/components/CalendarForTimetable";

function ViewRoomDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room")?.toUpperCase() || "";

  // Room selection state
  const [selectedRoom, setSelectedRoom] = useState(roomFromUrl);

  // Room data state
  const [data, setData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch room data
  const fetchRoomData = async (roomName: string) => {
    if (!roomName) {
      setData(null);
      return;
    }

    if (!listOfRooms.includes(roomName)) {
      setError("Invalid room name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getRoomData(roomName);
      if (!result) {
        setError("No data found for this room");
      } else {
        setData(result);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch room data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync selected room from URL
  useEffect(() => {
    const urlRoom = searchParams.get("room")?.toUpperCase() || "";
    if (urlRoom && urlRoom !== selectedRoom) {
      setSelectedRoom(urlRoom);
    }
  }, [searchParams]);

  // Fetch data when selected room changes
  useEffect(() => {
    if (selectedRoom) {
      fetchRoomData(selectedRoom);
    } else {
      setData(null);
    }
  }, [selectedRoom]);

  const handleSelect = (roomName: string) => {
    setSelectedRoom(roomName);
    router.push(`/view-room-details?room=${encodeURIComponent(roomName)}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    setSelectedRoom("");
    setData(null);
    router.push("/view-room-details", { scroll: false });
  };

  // Transform rooms to combobox items
  const comboboxItems: ComboboxItem[] = useMemo(
    () =>
      listOfRooms.map((room) => ({
        value: room,
        label: room,
      })),
    []
  );

  // Get current event if room is occupied
  const currentEvent = useMemo(() => {
    if (!data?.timetable) return null;

    const now = new Date();
    return data.timetable.find((event) => {
      const startDate = event.startDateString;
      const endDate = event.endDateString;

      if (!startDate || !endDate) return false;

      return isWithinInterval(now, {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    });
  }, [data]);

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <PageHeader
        title="Room Timetable"
        description="View the detailed timetable for any room on the University of Central Lancashire Preston campus."
      />

      <SearchableCombobox
        title="Find a Room"
        description="Start typing a room name (e.g., CM234) to filter the list."
        icon={<DoorOpen className="size-5" />}
        placeholder="Select room..."
        searchPlaceholder="Search rooms..."
        emptyMessage="No room found."
        loadingMessage="Loading rooms..."
        items={comboboxItems}
        selectedValue={selectedRoom}
        onSelect={handleSelect}
        onClear={handleClear}
        isLoading={false}
        error={null}
        itemCount={listOfRooms.length}
        popoverWidth="w-[300px]"
      />

      {/* Room Data Content */}
      {error && <ErrorAlert message={error} />}

      {isLoading && <LoadingSpinner message="Loading room data..." />}

      {!isLoading && !error && data && (
        <div className="space-y-6">
          {/* Room Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Room Summary</CardTitle>
                <CardDescription>
                  Current status for {data.roomName}
                </CardDescription>
              </div>

              <div
                className={cn(
                  "size-8 rounded-full",
                  data.isFree ? "bg-green-500" : "bg-red-500"
                )}
              />
            </CardHeader>

            <CardContent className="space-y-4">
              <p>
                {data.roomName} is{" "}
                <span className="font-semibold">
                  {data.isFree ? "available" : "occupied"}
                </span>{" "}
                at {dateStringToReadable(data.dateBeingChecked)}.
              </p>

              {currentEvent && (
                <div className="rounded-lg border p-4">
                  <p className="font-medium">
                    {cleanModuleName(currentEvent.module)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {format(parseISO(currentEvent.startDateString), "h:mma")} to{" "}
                    {format(parseISO(currentEvent.endDateString), "h:mma")} by{" "}
                    <span className="font-medium">{currentEvent.lecturer}</span>
                  </p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Ends in:{" "}
                    {formatDistanceToNow(new Date(currentEvent.endDateString))}
                  </p>
                </div>
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
              <CalendarForTimetable timetable={data.timetable} />
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}

export default function ViewRoomDetailsPage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <LoadingSpinner />
        </section>
      }
    >
      <ViewRoomDetailsContent />
    </Suspense>
  );
}
