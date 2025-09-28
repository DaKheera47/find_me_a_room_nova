import { z } from "zod";

const roomSchema = z.object({
  buildingCode: z.string(),
  name: z.string(),
  url: z.string(),
});

const availableRoomSchema = z.object({
  room: roomSchema,
  availableMinutes: z.number(),
  nextBookingStart: z.string().optional(),
});

const roomsByDurationSchema = z.object({
  buildingCode: z.string(),
  timestamp: z.string(),
  availableRooms: z.array(availableRoomSchema),
  totalRoomsChecked: z.number(),
  roomsAvailableOverMinDuration: z.number(),
});

export type Room = z.infer<typeof roomSchema>;
export type AvailableRoom = z.infer<typeof availableRoomSchema>;
export type RoomsByDurationResponse = z.infer<typeof roomsByDurationSchema>;
export default roomsByDurationSchema;
