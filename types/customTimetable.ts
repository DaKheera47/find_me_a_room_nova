import { z } from "zod";

// Selection for a module and its groups
export const moduleSelectionSchema = z.object({
  moduleCode: z.string(),
  groups: z.array(z.string()),
});

// Response for groups endpoint
export const moduleGroupsSchema = z.object({
  moduleCode: z.string(),
  groups: z.array(z.string()),
  count: z.number(),
});

// Preview event
export const previewEventSchema = z.object({
  id: z.number(),
  roomName: z.string(),
  buildingCode: z.string(),
  day: z.string(),
  startDateString: z.string(),
  endDateString: z.string(),
  time: z.string(),
  moduleCode: z.string(),
  moduleName: z.string(),
  module: z.string(),
  lecturer: z.string(),
  group: z.string(),
});

// Preview response
export const timetablePreviewSchema = z.object({
  events: z.array(previewEventSchema),
  count: z.number(),
  generatedAt: z.string().nullable(),
});

// ICS link response
export const icsLinkResponseSchema = z.object({
  icsUrl: z.string(),
  webcalUrl: z.string(),
  googleCalendarUrl: z.string(),
  selections: z.array(moduleSelectionSchema),
});

export type ModuleSelection = z.infer<typeof moduleSelectionSchema>;
export type ModuleGroupsResponse = z.infer<typeof moduleGroupsSchema>;
export type PreviewEvent = z.infer<typeof previewEventSchema>;
export type TimetablePreviewResponse = z.infer<typeof timetablePreviewSchema>;
export type ICSLinkResponse = z.infer<typeof icsLinkResponseSchema>;
