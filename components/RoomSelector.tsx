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
import { cn } from "@/lib/utils";
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

                    <CardContent>
                        <form>
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
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        <Button
                            onClick={() => {
                                getRoomData(selection);
                            }}
                            variant="outline"
                        >
                            Get All Data
                        </Button>

                        <Button
                            onClick={() => {
                                isRoomAvailable(selection);
                            }}
                        >
                            Is Room Available
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="w-full md:w-2/3">
                    <CardHeader>
                        <CardTitle>Room Data</CardTitle>
                        <CardDescription>
                            Data for the selected room
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default RoomSelector;
