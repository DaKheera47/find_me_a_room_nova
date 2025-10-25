"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { getRoomsByDuration } from "@/lib/apiCalls";
import { RoomsByDurationResponse } from "@/types/roomsByDuration";
import RoomsByDurationTable from "@/components/RoomsByDurationTable";
import { listOfBuildings } from "@/content/listOfBuildings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FindFreeRoomContent() {
  const [data, setData] = useState<RoomsByDurationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const requestIdRef = useRef(0);

  const [buildingCode, setBuildingCode] = useQueryState(
    "building",
    parseAsString.withDefault(""),
  );
  const [duration, setDuration] = useQueryState(
    "duration",
    parseAsString.withDefault("15"),
  );

  const fetchRooms = useCallback(
    async (selectedBuilding: string, selectedDuration: string) => {
      if (!selectedBuilding) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getRoomsByDuration(
          selectedBuilding,
          parseInt(selectedDuration || "15", 10),
        );

        if (requestId === requestIdRef.current) {
          setData(result);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError("Failed to fetch room data. Please try again.");
        }
        console.error("Error fetching rooms by duration:", err);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingCode) return;

    await fetchRooms(buildingCode, duration ?? "15");
  };

  const handleBuildingChange = (value: string) => {
    void setBuildingCode(value);
    setHasAutoFetched(false);
  };

  const handleDurationChange = (value: string) => {
    void setDuration(value);
    setHasAutoFetched(false);
  };

  useEffect(() => {
    if (data) {
      setData(null);
      setError(null);
    }
  }, [buildingCode, duration]);

  useEffect(() => {
    if (hasAutoFetched) return;
    if (!buildingCode) return;

    setHasAutoFetched(true);
    void fetchRooms(buildingCode, duration ?? "15");
  }, [buildingCode, duration, fetchRooms, hasAutoFetched]);

  return (
    <section className="container gap-6 pb-8 pt-6 md:py-10">
      <div className="mb-6 flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">
          UCLan Free Room Finder
        </h1>
        <span className="w-fit bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
          Find rooms available for your desired duration, sorted by availability
        </span>

        <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
          Check which rooms are available for your specified minimum duration
          across the University of Central Lancashire Preston campus. Choose
          from 15 minutes to 3 hours. Results are sorted by longest availability
          first.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Find Available Rooms</CardTitle>
            <CardDescription>
              Select a building and minimum duration to find available rooms
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="building">Building</Label>
                    <Select
                      required
                      value={buildingCode ?? ""}
                      onValueChange={handleBuildingChange}
                    >
                      <SelectTrigger id="building">
                        <SelectValue placeholder="Select a building" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {listOfBuildings.map((building) => (
                          <SelectItem
                            key={building.buildingCode}
                            value={building.buildingCode}
                            className="capitalize"
                          >
                            {building.buildingCode} - {building.buildingName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Minimum Duration</Label>
                    <Select
                      value={duration ?? "15"}
                      onValueChange={handleDurationChange}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!buildingCode || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    "Find Rooms"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <RoomsByDurationTable
            rooms={data.availableRooms}
            buildingCode={data.buildingCode}
            totalRoomsChecked={data.totalRoomsChecked}
            roomsAvailableOverMinDuration={data.roomsAvailableOverMinDuration}
            minDurationMinutes={parseInt(duration ?? "15", 10)}
          />
        )}
      </div>
    </section>
  );
}

export default function FindFreeRoomPage() {
  return (
    <Suspense
      fallback={
        <section className="container gap-6 pb-8 pt-6 md:py-10">
          <p className="text-sm text-muted-foreground">Preparing search options...</p>
        </section>
      }
    >
      <FindFreeRoomContent />
    </Suspense>
  );
}
