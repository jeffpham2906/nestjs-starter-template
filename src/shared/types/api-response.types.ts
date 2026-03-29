import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Base response structure
const baseResponseSchema = z.object({
  message: z.string().describe('Response message'),
  status: z.literal('success').describe('Response status'),
});

// Pagination schemas
export const PaginationMetaSchema = z.object({
  count: z.int().min(0).describe('Number of items in current page'),
  page: z.int().min(1).describe('Current page number'),
  pageSize: z.int().min(1).describe('Number of items per page'),
  totalPages: z.int().min(0).describe('Total number of pages'),
});

export const PaginationLinksSchema = z.object({
  self: z.url().describe('Link to current page'),
  first: z.url().describe('Link to first page'),
  last: z.url().describe('Link to last page'),
  prev: z.url().nullable().describe('Link to previous page'),
  next: z.url().nullable().describe('Link to next page'),
});

// Standard API response schemas
export const ApiResponseSchema = baseResponseSchema.extend({
  data: z.any().describe('Response data'),
});

export const PaginatedApiResponseSchema = baseResponseSchema.extend({
  data: z.array(z.any()).describe('Array of response data'),
  meta: PaginationMetaSchema.describe('Pagination metadata'),
  links: PaginationLinksSchema.describe('Pagination links'),
});

// DTO classes
export class ApiResponseDto extends createZodDto(ApiResponseSchema) {}
export class PaginatedApiResponseDto extends createZodDto(
  PaginatedApiResponseSchema,
) {}
export class PaginationMetaDto extends createZodDto(PaginationMetaSchema) {}
export class PaginationLinksDto extends createZodDto(PaginationLinksSchema) {}

// Types
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data: T;
};
export type PaginatedApiResponse<T = any> = z.infer<
  typeof PaginatedApiResponseSchema
> & { data: T[] };
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginationLinks = z.infer<typeof PaginationLinksSchema>;

// Helper functions for creating typed DTOs
export const createApiResponseDto = <T>(dataSchema: z.ZodType<T>) =>
  createZodDto(baseResponseSchema.extend({ data: dataSchema }));

export const createPaginatedApiResponseDto = <T>(dataSchema: z.ZodType<T>) =>
  createZodDto(
    baseResponseSchema.extend({
      data: z.array(dataSchema),
      meta: PaginationMetaSchema,
      links: PaginationLinksSchema,
    }),
  );
