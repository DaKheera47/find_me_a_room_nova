import { z } from "zod";

import { timetableEntrySchema } from "./roomData";

export const moduleInfoSchema = z.object({
  code: z.string(),
  name: z.string(),
  eventCount: z.number().optional(),
});

export const moduleListSchema = z.object({
  modules: z.array(moduleInfoSchema),
  count: z.number(),
  generatedAt: z.string().nullable(),
});

export const moduleScheduleSchema = z.object({
  module: z.object({
    code: z.string(),
    name: z.string(),
  }),
  timetable: z.array(timetableEntrySchema),
  summary: z.object({
    totalSessions: z.number(),
    lecturers: z.array(z.string()),
    sessionTypes: z.array(z.string()),
  }),
  generatedAt: z.string().nullable(),
});

export type ModuleInfo = z.infer<typeof moduleInfoSchema>;
export type ModuleListResponse = z.infer<typeof moduleListSchema>;
export type ModuleScheduleResponse = z.infer<typeof moduleScheduleSchema>;
