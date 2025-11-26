"use client";

import { AvailableRoom } from "@/types/roomsByDuration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import Link from "next/link";

interface RoomsByDurationTableProps {
  rooms: AvailableRoom[];
  buildingCode: string;
  totalRoomsChecked: number;
  roomsAvailableOverMinDuration: number;
  minDurationMinutes?: number;
}

export default function RoomsByDurationTable({
  rooms,
  buildingCode,
  totalRoomsChecked,
  roomsAvailableOverMinDuration,
  minDurationMinutes = 15,
}: RoomsByDurationTableProps) {
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return "Occupied";
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatNextBooking = (nextBookingStart?: string): string => {
    if (!nextBookingStart) return "No upcoming bookings";

    const bookingTime = new Date(nextBookingStart);
    return bookingTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDurationColor = (minutes: number): string => {
    if (minutes === 0) return "text-red-600 dark:text-red-400";
    if (minutes < 30) return "text-yellow-600 dark:text-yellow-400";
    if (minutes < 60) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Building {buildingCode} - Room Availability Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Total Rooms:</span>
              <span className="ml-2 font-semibold">{totalRoomsChecked}</span>
            </div>
            <div>
              <span className="text-muted-foreground">
                Available ({minDurationMinutes}+ min):
              </span>
              <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                {roomsAvailableOverMinDuration}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2 font-semibold">
                {new Date().toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      {rooms.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Available Rooms ({minDurationMinutes}+ minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-semibold">Room</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Available For
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Next Booking
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Timetable
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((roomData, index) => (
                    <tr
                      key={roomData.room.name}
                      className={`border-b hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-muted/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {roomData.room.name}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${getDurationColor(
                          roomData.availableMinutes,
                        )}`}
                      >
                        {formatDuration(roomData.availableMinutes)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatNextBooking(roomData.nextBookingStart)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/rooms?room=${roomData.room.name}`}
                          className="inline-flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                          <Eye className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p className="mb-2 text-lg">
                No rooms available for {minDurationMinutes}+ minutes
              </p>
              <p className="text-sm">
                All rooms in building {buildingCode} are either occupied or have
                availability windows shorter than {minDurationMinutes} minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
