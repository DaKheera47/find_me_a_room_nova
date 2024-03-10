import { RoomData } from "@/types/roomData";

// Function to fetch room data
export const getRoomData = async (roomName: string): Promise<RoomData> => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/get-all-room-info",
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
    return data;
  } catch (error) {
    console.error("Failed to fetch room data:", error);
    throw error;
  }
};
