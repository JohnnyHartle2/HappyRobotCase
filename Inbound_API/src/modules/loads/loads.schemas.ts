import { z } from "zod";

export const LoadSchema = z.object({
  load_id: z.string(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  pickup_datetime: z.string().datetime(),
  delivery_datetime: z.string().datetime(),
  equipment_type: z.string().min(1),
  loadboard_rate: z.number().positive(),
  notes: z.string().nullable().optional(),
  weight: z.number().int().positive().nullable().optional(),
  commodity_type: z.string().min(1),
  num_of_pieces: z.number().int().positive(),
  miles: z.number().int().positive(),
  dimensions: z.string().min(1),
});

export const LoadUpdateSchema = LoadSchema.partial().omit({ load_id: true });

export const LoadQuerySchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  pickup_datetime_from: z.string().datetime().optional(),
  pickup_datetime_to: z.string().datetime().optional(),
  equipment_type: z.string().optional(),
  min_loadboard_rate: z.string().transform(Number).optional(),
  max_loadboard_rate: z.string().transform(Number).optional(),
  max_miles: z.string().transform(Number).optional(),
  q: z.string().optional(),
  page: z.string().transform(Number).default("1"),
  page_size: z.string().transform(Number).default("20"),
  sort_by: z
    .enum(["pickup_datetime", "delivery_datetime", "loadboard_rate", "miles"])
    .default("pickup_datetime"),
  sort_dir: z.enum(["asc", "desc"]).default("asc"),
});

export const LoadResponseSchema = z.object({
  data: z.array(LoadSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
});

export const LoadIdParamsSchema = z.object({
  load_id: z.string().min(1),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export const ErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export const LoadModelResponse = LoadSchema;
export const PaginatedLoadListResponse = LoadResponseSchema;

export type Load = z.infer<typeof LoadSchema>;
export type LoadUpdate = z.infer<typeof LoadUpdateSchema>;
export type LoadQuery = z.infer<typeof LoadQuerySchema>;
export type LoadResponse = z.infer<typeof LoadResponseSchema>;
export type LoadIdParams = z.infer<typeof LoadIdParamsSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type LoadModelResponse = z.infer<typeof LoadModelResponse>;
export type PaginatedLoadListResponse = z.infer<
  typeof PaginatedLoadListResponse
>;
