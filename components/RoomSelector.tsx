"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type RoomDataFetcherProps = {
    listOfRooms: string[];
};

const RoomDataFetcher = ({ listOfRooms }: RoomDataFetcherProps) => {
    // State to hold the current selection and room data
    const [selection, setSelection] = useState("CM034");
    const [data, setData] = useState("");

    // Function to handle selection changes
    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoom = event.target.value;
        console.log(selectedRoom);
        setSelection(selectedRoom);
    };

    // Function to fetch room data
    const getRoomData = async (roomName = "CM034") => {
        try {
            const response = await fetch("http://127.0.0.1:3000/scrape-room", {
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
    };

    // Function to fetch room data
    const isRoomAvailable = async (roomName = "CM034") => {
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
    };

    return (
        <div>
            <select value={selection} onChange={onChange}>
                {listOfRooms.map((room) => (
                    <option key={room} value={room}>
                        {room}
                    </option>
                ))}
            </select>

            <Button
                onClick={() => {
                    getRoomData(selection);
                }}
            >
                Get Room Data
            </Button>

            <Button
                onClick={() => {
                    isRoomAvailable(selection);
                }}
            >
                Is Room Available
            </Button>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default RoomDataFetcher;
