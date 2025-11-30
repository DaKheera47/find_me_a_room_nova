import { z } from "zod";

// Course basic info
export const courseSchema = z.object({
  id: z.number(),
  url: z.string(),
  type: z.enum(["undergrad", "postgrad"]),
  title: z.string(),
});

// Course list response
export const courseListSchema = z.object({
  courses: z.array(courseSchema),
  count: z.number(),
});

// Course module
export const courseModuleSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(["compulsory", "optional", "other"]),
});

// Course year with modules
export const courseYearSchema = z.object({
  id: z.number(),
  label: z.string(),
  compulsoryModules: z.array(courseModuleSchema),
  optionalModules: z.array(courseModuleSchema),
  otherModules: z.array(courseModuleSchema),
});

// Course details response
export const courseDetailsSchema = z.object({
  course: courseSchema,
  years: z.array(courseYearSchema),
});

// Types
export type Course = z.infer<typeof courseSchema>;
export type CourseListResponse = z.infer<typeof courseListSchema>;
export type CourseModule = z.infer<typeof courseModuleSchema>;
export type CourseYear = z.infer<typeof courseYearSchema>;
export type CourseDetailsResponse = z.infer<typeof courseDetailsSchema>;
