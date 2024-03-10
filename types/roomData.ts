// schemas/roomDataSchema.ts
import { z } from "zod";

const timetableEntrySchema = z.object({
    topIdx: z.number(),
    slotInDay: z.number(),
    time: z.string(),
    module: z.string(),
    lecturer: z.string(),
    group: z.string(),
    roomName: z.string(),
    day: z.string(),
    startDateString: z.string(),
    endDateString: z.string(),
});

export type TimetableEntry = z.infer<typeof timetableEntrySchema>;

const roomDataSchema = z.object({
    timetable: z.array(timetableEntrySchema),
    roomName: z.string(),
    dateBeingChecked: z.string(),
    isFree: z.boolean(),
});

export type RoomData = z.infer<typeof roomDataSchema>;
export default roomDataSchema;
