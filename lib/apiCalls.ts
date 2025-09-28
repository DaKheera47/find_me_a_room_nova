import { RoomData } from "@/types/roomData";
import { HealthStatus } from "@/types/health";
import healthStatusSchema from "@/types/health";

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

// Function to fetch health status
export const getHealthStatus = async (): Promise<HealthStatus> => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/health",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();

    // Validate the response with Zod schema
    const validatedData = healthStatusSchema.parse(data);
    return validatedData;
  } catch (error) {
    console.error("Failed to fetch health status:", error);
    throw error;
  }
};
