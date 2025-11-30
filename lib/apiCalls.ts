import { RoomData } from "@/types/roomData";
import { HealthStatus } from "@/types/health";
import healthStatusSchema from "@/types/health";
import { RoomsByDurationResponse } from "@/types/roomsByDuration";
import roomsByDurationSchema from "@/types/roomsByDuration";
import {
  LecturerListResponse,
  LecturerScheduleResponse,
  lecturerListSchema,
  lecturerScheduleSchema,
} from "@/types/lecturer";
import {
  ModuleListResponse,
  ModuleScheduleResponse,
  moduleListSchema,
  moduleScheduleSchema,
} from "@/types/module";
import {
  ModuleSelection,
  ModuleGroupsResponse,
  TimetablePreviewResponse,
  ICSLinkResponse,
  moduleGroupsSchema,
  timetablePreviewSchema,
  icsLinkResponseSchema,
} from "@/types/customTimetable";

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

// Function to fetch rooms by duration for a building
export const getRoomsByDuration = async (
  buildingCode: string,
  minDurationMinutes: number = 15,
): Promise<RoomsByDurationResponse> => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/find-rooms-by-duration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buildingCode: buildingCode,
          minDurationMinutes: minDurationMinutes,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch rooms by duration: ${response.status}`);
    }

    const data = await response.json();

    // Validate the response with Zod schema
    const validatedData = roomsByDurationSchema.parse(data);
    return validatedData;
  } catch (error) {
    console.error("Failed to fetch rooms by duration:", error);
    throw error;
  }
};

export const getLecturers = async (
  refresh = false,
): Promise<LecturerListResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/lecturers${refresh ? "?refresh=true" : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch lecturers: ${response.status}`);
    }

    const data = await response.json();
    return lecturerListSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch lecturers:", error);
    throw error;
  }
};

export const getLecturerSchedule = async (
  lecturerName: string,
): Promise<LecturerScheduleResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/lecturers/${encodeURIComponent(lecturerName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch lecturer timetable: ${response.status}`,
      );
    }

    const data = await response.json();
    return lecturerScheduleSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch lecturer timetable:", error);
    throw error;
  }
};

// Module API calls
export const getModules = async (): Promise<ModuleListResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/modules`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch modules: ${response.status}`);
    }

    const data = await response.json();
    return moduleListSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    throw error;
  }
};

export const getModuleSchedule = async (
  moduleCode: string,
): Promise<ModuleScheduleResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/modules/${encodeURIComponent(moduleCode)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch module timetable: ${response.status}`);
    }

    const data = await response.json();
    return moduleScheduleSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch module timetable:", error);
    throw error;
  }
};

// Custom Timetable / ICS API calls
export const getModuleGroups = async (
  moduleCode: string,
): Promise<ModuleGroupsResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/modules/${encodeURIComponent(moduleCode)}/groups`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch module groups: ${response.status}`);
    }

    const data = await response.json();
    return moduleGroupsSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch module groups:", error);
    throw error;
  }
};

export const getTimetablePreview = async (
  selections: ModuleSelection[],
): Promise<TimetablePreviewResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/timetable/preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selections }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch timetable preview: ${response.status}`);
    }

    const data = await response.json();
    return timetablePreviewSchema.parse(data);
  } catch (error) {
    console.error("Failed to fetch timetable preview:", error);
    throw error;
  }
};

export const generateICSLink = async (
  selections: ModuleSelection[],
): Promise<ICSLinkResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/timetable/generate-link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selections }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to generate ICS link: ${response.status}`);
    }

    const data = await response.json();
    return icsLinkResponseSchema.parse(data);
  } catch (error) {
    console.error("Failed to generate ICS link:", error);
    throw error;
  }
};
