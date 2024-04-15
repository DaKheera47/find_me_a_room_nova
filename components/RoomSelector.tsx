"use client";

import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";

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
import { listOfBuildings } from "@/content/listOfBuildings";
import { cn } from "@/lib/utils";
import useRoomStore from "@/store/roomStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RoomDataFetcherProps = {
  listOfRooms: string[];
};

const RoomSelector = ({ listOfRooms }: RoomDataFetcherProps) => {
  // State to hold the current selection and room data
  const { data, isLoading, setData, setIsLoading } = useRoomStore();
  const [selectedBuildingCode, setBuildingCode] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(" ");
  const [listOfRoomsToShow, setListOfRoomsToShow] = useState([" "]);
  const router = useRouter();

  const onBuildingChange = (buildingCode: string) => {
    setBuildingCode(buildingCode);

    // get all the rooms in the building
    const out = listOfRooms.filter((room) => {
      return room.startsWith(buildingCode);
    });

    if (!out.includes(selectedRoom)) {
      // if no rooms are found, set the selected room to " "
      setSelectedRoom(" ");
    }

    setListOfRoomsToShow(out);
  };

  // Function to fetch room data
  const isRoomAvailable = async (roomName: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/is-room-free",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: roomName,
          }),
        },
      );
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="flex w-full gap-4 max-md:flex-wrap">
        <Card className="w-full md:w-1/3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Is Room Available</CardTitle>
              <CardDescription>Find if a room is available</CardDescription>
            </div>

            <div
              className={cn(
                "mb-6 size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
                !isLoading && "invisible",
              )}
            />
          </CardHeader>

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
                      <SelectValue placeholder="Select the building" />
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
                  <Label htmlFor="room">Room</Label>
                  <Select
                    required
                    disabled={selectedBuildingCode === ""}
                    onValueChange={(value) => setSelectedRoom(value)}
                  >
                    <SelectTrigger id="room">
                      <SelectValue placeholder="Select the room" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                      {listOfRoomsToShow.map((room, idx) => (
                        <SelectItem
                          key={room + selectedBuildingCode}
                          value={room}
                          className="capitalize"
                        >
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Link
              aria-disabled={selectedRoom === " "}
              tabIndex={selectedRoom === " " ? -1 : undefined}
              href={`/view-room-details/?room=${selectedRoom}`}
              className={cn(
                buttonVariants({
                  variant: selectedRoom === " " ? "outline" : "default",
                }),
                {
                  "pointer-events-none cursor-not-allowed":
                    selectedRoom === " ",
                },
              )}
            >
              View Room Data
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default RoomSelector;
