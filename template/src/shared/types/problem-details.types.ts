import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Problem Details for HTTP APIs (RFC 7807)
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export const ProblemDetailsSchema = z.object({
  /**
   * A URI reference that identifies the problem type.
   * When dereferenced, it SHOULD provide human-readable documentation for the problem type.
   * Defaults to "about:blank" when omitted.
   */
  type: z.string().describe('A URI reference that identifies the problem type'),

  /**
   * A short, human-readable summary of the problem type.
   * It SHOULD NOT change from occurrence to occurrence of the problem,
   * except for purposes of localization.
   */
  title: z
    .string()
    .describe('A short, human-readable summary of the problem type'),

  /**
   * The HTTP status code for this occurrence of the problem.
   */
  status: z
    .int()
    .describe('The HTTP status code for this occurrence of the problem'),

  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  detail: z
    .string()
    .describe(
      'A human-readable explanation specific to this occurrence of the problem',
    ),

  /**
   * A URI reference that identifies the specific occurrence of the problem.
   * It may or may not yield further information if dereferenced.
   */
  instance: z
    .string()
    .optional()
    .describe(
      'A URI reference that identifies the specific occurrence of the problem',
    ),
});

/**
 * Extended Problem Details for validation errors.
 * Includes additional fields for field-level and form-level validation errors.
 */
export const ValidationProblemDetailsSchema = ProblemDetailsSchema.extend({
  /**
   * Field-specific validation errors.
   * Key is the field name, value is an array of error messages for that field.
   */
  fieldErrors: z
    .record(z.string(), z.array(z.string()).optional())
    .describe('Field-specific validation errors'),

  /**
   * Form-level validation errors that don't apply to specific fields.
   */
  formErrors: z
    .array(z.string())
    .describe(
      "Form-level validation errors that don't apply to specific fields",
    ),
});

// DTO classes for Swagger documentation
export class ProblemDetailsDto extends createZodDto(ProblemDetailsSchema) {}
export class ValidationProblemDetailsDto extends createZodDto(
  ValidationProblemDetailsSchema,
) {}

// Type exports for backwards compatibility
export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
export type ValidationProblemDetails = z.infer<
  typeof ValidationProblemDetailsSchema
>;

/**
 * Error type constants for consistent problem type URIs.
 */
export const ProblemTypes = {
  VALIDATION_ERROR: 'https://example.com/problems/validation-error',
  BAD_REQUEST: 'https://example.com/problems/bad-request',
  NOT_FOUND: 'https://example.com/problems/not-found',
  UNAUTHORIZED: 'https://example.com/problems/unauthorized',
  FORBIDDEN: 'https://example.com/problems/forbidden',
  CONFLICT: 'https://example.com/problems/conflict',
  INTERNAL_SERVER_ERROR: 'https://example.com/problems/internal-server-error',
  SERVICE_UNAVAILABLE: 'https://example.com/problems/service-unavailable',
} as const;

/**
 * Problem type titles for consistent error messaging.
 */
export const ProblemTitles = {
  VALIDATION_ERROR: 'Validation Error',
  BAD_REQUEST: 'Bad Request',
  NOT_FOUND: 'Not Found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  CONFLICT: 'Conflict',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
} as const;
