"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";

import { getRoomsByDuration } from "@/lib/apiCalls";
import { RoomsByDurationResponse } from "@/types/roomsByDuration";
import RoomsByDurationTable from "@/components/RoomsByDurationTable";
import { listOfBuildings } from "@/content/listOfBuildings";
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
import {
  SearchableCombobox,
  ComboboxItem,
} from "@/components/SearchableCombobox";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { trackBuildingSearch, trackFreeRoomsResult } from "@/lib/umami";

function FindFreeRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buildingFromUrl = searchParams.get("building") || "";
  const durationFromUrl = searchParams.get("duration") || "15";

  const requestIdRef = useRef(0);

  // Selection state
  const [selectedBuilding, setSelectedBuilding] = useState(buildingFromUrl);
  const [duration, setDuration] = useState(durationFromUrl);

  // Data state
  const [data, setData] = useState<RoomsByDurationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(
    async (building: string, dur: string) => {
      if (!building) {
        setData(null);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getRoomsByDuration(building, parseInt(dur, 10));

        if (requestId === requestIdRef.current) {
          setData(result);
          // Track successful search result
          trackFreeRoomsResult(
            result.buildingCode,
            result.roomsAvailableOverMinDuration,
            result.totalRoomsChecked,
            parseInt(dur, 10)
          );
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
    []
  );

  // Sync from URL
  useEffect(() => {
    const urlBuilding = searchParams.get("building") || "";
    const urlDuration = searchParams.get("duration") || "15";

    if (urlBuilding !== selectedBuilding) {
      setSelectedBuilding(urlBuilding);
    }
    if (urlDuration !== duration) {
      setDuration(urlDuration);
    }
  }, [searchParams]);

  // Fetch data when selection changes
  useEffect(() => {
    if (selectedBuilding) {
      fetchRooms(selectedBuilding, duration);
    } else {
      setData(null);
    }
  }, [selectedBuilding, duration, fetchRooms]);

  const updateUrl = (building: string, dur: string) => {
    const params = new URLSearchParams();
    if (building) params.set("building", building);
    if (dur && dur !== "15") params.set("duration", dur);

    const query = params.toString();
    router.push(`/buildings${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleBuildingSelect = (value: string) => {
    trackBuildingSearch(value, parseInt(duration, 10), "building-page");
    setSelectedBuilding(value);
    updateUrl(value, duration);
  };

  const handleBuildingClear = () => {
    setSelectedBuilding("");
    setData(null);
    router.push("/buildings", { scroll: false });
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    updateUrl(selectedBuilding, value);
  };

  // Transform buildings to combobox items
  const comboboxItems: ComboboxItem[] = useMemo(
    () =>
      listOfBuildings.map((building) => ({
        value: building.buildingCode,
        label: building.buildingCode,
        sublabel: building.buildingName,
      })),
    []
  );

  const selectedBuildingInfo = useMemo(
    () => listOfBuildings.find((b) => b.buildingCode === selectedBuilding),
    [selectedBuilding]
  );

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <PageHeader
        title="Free Room Finder"
        description="Find rooms available for your desired duration across the University of Central Lancashire Preston campus. Results are sorted by longest availability first."
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SearchableCombobox
          title="Find Available Rooms"
          description="Select a building to see which rooms are currently available."
          icon={<Building2 className="size-5" />}
          placeholder="Select building..."
          searchPlaceholder="Search buildings..."
          emptyMessage="No building found."
          loadingMessage="Loading buildings..."
          items={comboboxItems}
          selectedValue={selectedBuilding}
          onSelect={handleBuildingSelect}
          onClear={handleBuildingClear}
          isLoading={false}
          error={null}
          itemCount={listOfBuildings.length}
          popoverWidth="w-[350px]"
        />

        {/* Duration Selector */}
        {selectedBuilding && (
          <Card className="w-full max-w-xs">
            <CardHeader>
              <CardTitle className="text-base">Minimum Duration</CardTitle>
              <CardDescription>
                Filter rooms available for at least this long
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="duration" className="sr-only">
                Duration
              </Label>
              <Select value={duration} onValueChange={handleDurationChange}>
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {error && <ErrorAlert message={error} />}

      {isLoading && <LoadingSpinner message="Finding available rooms..." />}

      {!isLoading && !error && data && (
        <div className="space-y-6">
          {/* Building Header */}
          {selectedBuildingInfo && (
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">
                {selectedBuildingInfo.buildingName}
              </h2>
              <p className="text-muted-foreground">
                Showing rooms available for at least {duration} minutes
              </p>
            </div>
          )}

          <RoomsByDurationTable
            rooms={data.availableRooms}
            buildingCode={data.buildingCode}
            totalRoomsChecked={data.totalRoomsChecked}
            roomsAvailableOverMinDuration={data.roomsAvailableOverMinDuration}
            minDurationMinutes={parseInt(duration, 10)}
          />
        </div>
      )}
    </section>
  );
}

export default function FindFreeRoomPage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <LoadingSpinner />
        </section>
      }
    >
      <FindFreeRoomContent />
    </Suspense>
  );
}
