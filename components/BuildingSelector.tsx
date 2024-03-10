"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { BuildingInfo } from "@/content/listOfBuildings";
import { listOfRooms } from "@/content/listOfRooms";
import { cn, dateStringToReadable, getOrdinalNum } from "@/lib/utils";
import Link from "next/link";

type BuildingSelector = {
  listOfBuildings: BuildingInfo[];
};

const BuildingSelector = ({ listOfBuildings }: BuildingSelector) => {
  const [data, setData] = useState<RoomWithTimetable[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buildingCode, setBuildingCode] = useState("");
  const [floor, setFloor] = useState("0");
  const [listOfFloors, setListOfFloors] = useState(["0"]);

  const onBuildingChange = (buildingCode: string) => {
    setBuildingCode(buildingCode);

    // Get unique floors from the filtered rooms
    const floors = listOfRooms
      .filter((room) => room.startsWith(buildingCode)) // Filter rooms by building code
      .map((room) => {
        const floorNumber = room.substring(
          buildingCode.length,
          buildingCode.length + 1,
        );
        return isNaN(parseInt(floorNumber)) ? "0" : floorNumber; // Default to "0" if not a number
      })
      .filter((value, index, self) => self.indexOf(value) === index); // Unique floors

    setListOfFloors(floors);
  };

  // Function to fetch room data
  const getAvailableRoomsInBuilding = async (
    buildingCode: string,
    floor: string,
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
          "/get-available-rooms-in-building",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buildingCode,
            floorToFind: parseInt(floor),
          }),
        },
      );

      const data = await response.json();

      setData(data);
    } catch (error) {
      console.error("Failed to fetch rooms data:", error);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex w-full gap-4 max-md:flex-wrap">
      <Card className="w-full md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="capitalize">Are there free rooms?</CardTitle>
            <CardDescription>
              Find all rooms on a specific floor in a building
            </CardDescription>
          </div>

          <div
            className={cn(
              "mb-6 size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
              !isLoading && "invisible",
            )}
          />
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            getAvailableRoomsInBuilding(buildingCode, floor);
          }}
        >
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <div>
                  <Label htmlFor="building">Building</Label>
                  <Select
                    required
                    onValueChange={(value) => onBuildingChange(value)}
                  >
                    <SelectTrigger id="building">
                      <SelectValue placeholder="Select your building" />
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
                  <Label htmlFor="building">Floor</Label>
                  <Select
                    required
                    disabled={buildingCode === ""}
                    onValueChange={(value) => setFloor(value)}
                  >
                    <SelectTrigger id="building">
                      <SelectValue placeholder="Select the floor" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                      {listOfFloors.map((floor) => {
                        const floorLabel =
                          floor === "0"
                            ? "Ground floor"
                            : getOrdinalNum(parseInt(floor)) + " floor";
                        return (
                          <SelectItem
                            key={floor}
                            value={floor}
                            className="capitalize"
                          >
                            {floorLabel}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit">Get Available Rooms</Button>
          </CardFooter>
        </form>
      </Card>

      {data && (
        <Card className="w-full md:w-2/3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Building Summary -{" "}
                {floor === "0"
                  ? "Ground floor"
                  : getOrdinalNum(parseInt(floor)) + " floor"}
              </CardTitle>

              <CardDescription className="mt-2">
                {data.length} rooms free in {buildingCode} on{" "}
                {floor === "0"
                  ? "Ground floor"
                  : getOrdinalNum(parseInt(floor)) + " floor"}
                . Last Checked: {dateStringToReadable(new Date())}
              </CardDescription>
            </div>

            <div
              className={cn(
                "flex size-4 items-center justify-center rounded-full p-4 font-bold text-black md:size-8",
                data.length === 0 ? "bg-red-500" : "bg-green-500",
              )}
            >
              {data.length}
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4">
            {data.map((room) => (
              <Link
                className="flex w-full select-none flex-col justify-end rounded-md border border-neutral-400 p-6 no-underline outline-none transition-all hover:bg-neutral-400/40 hover:shadow-md"
                href={`/view-room-details/?room=${room.room.name}`}
                key={room.room.name}
              >
                <span className="text-center text-lg font-medium">
                  {room.room.name}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuildingSelector;
