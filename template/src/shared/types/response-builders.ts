import {
  ApiResponse,
  PaginatedApiResponse,
  PaginationLinks,
  PaginationMeta,
} from './api-response.types';

/**
 * Creates a standardized success response wrapper.
 *
 * @param data - The response data
 * @param message - Success message describing the operation
 * @returns Standardized API response object
 */
export const createSuccessResponse = <T>(
  data: T,
  message: string,
): ApiResponse<T> => ({
  data,
  message,
  status: 'success',
});

/**
 * Creates a standardized paginated response wrapper.
 *
 * @param data - Array of response data
 * @param meta - Pagination metadata
 * @param links - Pagination navigation links
 * @param message - Success message describing the operation
 * @returns Standardized paginated API response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  meta: PaginationMeta,
  links: PaginationLinks,
  message: string,
): PaginatedApiResponse<T> => ({
  data,
  meta,
  links,
  message,
  status: 'success',
});
