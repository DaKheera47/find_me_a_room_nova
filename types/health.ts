import { z } from "zod";

const healthStatusSchema = z.object({
  server: z.object({
    status: z.string(),
    timestamp: z.string(),
    uptime: z.number(),
  }),
  uclan: z.object({
    status: z.string(),
    responseTime: z.number(),
  }),
  overall: z.string(),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
export default healthStatusSchema;