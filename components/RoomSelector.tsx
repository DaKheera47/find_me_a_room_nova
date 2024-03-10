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
import { cn, dateStringToReadable } from "@/lib/utils";
import useRoomStore from "@/store/roomStore";

type RoomDataFetcherProps = {
    listOfRooms: string[];
};

const RoomSelector = ({ listOfRooms }: RoomDataFetcherProps) => {
    // State to hold the current selection and room data
    const [selection, setSelection] = useState("CM034");
    const { data, isLoading, setData, setIsLoading } = useRoomStore();

    // Function to fetch room data
    const getRoomData = async (roomName: string) => {
        setIsLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:3000/get-all-room-info",
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

    // Function to fetch room data
    const isRoomAvailable = async (roomName: string) => {
        setIsLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:3000/is-room-free", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomName: roomName,
                }),
            });
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
                        <div>
                            <CardTitle>Is Room Available</CardTitle>
                            <CardDescription>
                                Find if a room is available
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

                            getRoomData(selection);
                        }}
                    >
                        <CardContent>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="room">Room</Label>

                                    <Select
                                        required
                                        onValueChange={(value) =>
                                            setSelection(value)
                                        }
                                    >
                                        <SelectTrigger id="room">
                                            <SelectValue placeholder="Select your room" />
                                        </SelectTrigger>

                                        <SelectContent position="popper">
                                            {listOfRooms.map((room) => (
                                                <SelectItem
                                                    key={room}
                                                    value={room}
                                                >
                                                    {room}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end">
                            <Button type="submit">Get Room Data</Button>
                        </CardFooter>
                    </form>
                </Card>

                {data && (
                    <Card className="w-full md:w-2/3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Room Summary</CardTitle>
                                <CardDescription>
                                    Summary for {selection}
                                </CardDescription>
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
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default RoomSelector;
