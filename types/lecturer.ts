import { z } from "zod";

import { timetableEntrySchema } from "./roomData";

export const lecturerListSchema = z.object({
  lecturers: z.array(z.string()),
  generatedAt: z.string(),
});

export const lecturerScheduleSchema = z.object({
  lecturer: z.string(),
  timetable: z.array(timetableEntrySchema),
  generatedAt: z.string(),
});

export type LecturerListResponse = z.infer<typeof lecturerListSchema>;
export type LecturerScheduleResponse = z.infer<typeof lecturerScheduleSchema>;
