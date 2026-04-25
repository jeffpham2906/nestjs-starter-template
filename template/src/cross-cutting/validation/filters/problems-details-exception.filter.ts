import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ServiceUnavailableException,
  Inject,
} from '@nestjs/common';
import {
  ProblemDetails,
  ValidationProblemDetails,
  ProblemTypes,
  ProblemTitles,
} from '@shared/types/problem-details.types';
import { ILoggerFactory } from '@cross-cutting/logging/logger.factory';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '@cross-cutting/auth/claims-helper';

@Catch(HttpException)
export class ProblemDetailsExceptionFilter implements ExceptionFilter {
  private readonly loggerFactory: ILoggerFactory;

  constructor(@Inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
    this.loggerFactory = loggerFactory;
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const logger = this.loggerFactory.createLogger(request.url);
    const requestContext = this.extractRequestContext(request);

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Check if this is a validation error with structured data
    if (
      exception instanceof BadRequestException &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const typedExceptionResponse = exceptionResponse as Record<
        string,
        unknown
      >;

      // Check if it has validation error structure (fieldErrors, formErrors)
      if (
        typedExceptionResponse.fieldErrors ||
        typedExceptionResponse.formErrors
      ) {
        const validationProblemDetails: ValidationProblemDetails = {
          type: ProblemTypes.VALIDATION_ERROR,
          title: ProblemTitles.VALIDATION_ERROR,
          status,
          detail:
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            typedExceptionResponse.message?.toString() || exception.message,
          instance: request.originalUrl,
          fieldErrors:
            (typedExceptionResponse.fieldErrors as Record<
              string,
              string[] | undefined
            >) || {},
          formErrors: (typedExceptionResponse.formErrors as string[]) || [],
        };

        response
          .status(status)
          .header('Content-Type', 'application/problem+json')
          .send(validationProblemDetails);
        return;
      }
    }

    // Extract detail message from exception response
    let detail: string;
    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const response = exceptionResponse as Record<string, unknown>;
      let message = response.message || response.error || exception.message;

      // Handle array messages (join them into a single string)
      if (Array.isArray(message)) {
        message = message.join(', ');
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      detail = String(message);
    } else {
      detail = exception.message;
    }

    // Sanitise 5xx responses — never expose internal details to clients
    if (status >= 500) {
      detail = 'An unexpected error occurred';
    }

    // Map exception type to Problem Details type and title
    const { type, title } = this.mapExceptionToProblemType(exception);

    const problemDetails: ProblemDetails = {
      type,
      title,
      status,
      detail,
      instance: request.url,
    };

    // Log the exception with context
    if (status >= 500) {
      logger.error('HTTP exception occurred', {
        context: requestContext,
        exception: exception.name,
        message: exception.message,
        status,
      });
    } else {
      logger.warn('HTTP exception occurred', {
        context: requestContext,
        exception: exception.name,
        message: exception.message,
        status,
      });
    }

    response
      .status(status)
      .header('Content-Type', 'application/problem+json')
      .send(problemDetails);
  }

  private mapExceptionToProblemType(exception: HttpException): {
    type: string;
    title: string;
  } {
    switch (true) {
      case exception instanceof BadRequestException:
        return {
          type: ProblemTypes.BAD_REQUEST,
          title: ProblemTitles.BAD_REQUEST,
        };
      case exception instanceof UnauthorizedException:
        return {
          type: ProblemTypes.UNAUTHORIZED,
          title: ProblemTitles.UNAUTHORIZED,
        };
      case exception instanceof ForbiddenException:
        return {
          type: ProblemTypes.FORBIDDEN,
          title: ProblemTitles.FORBIDDEN,
        };
      case exception instanceof NotFoundException:
        return {
          type: ProblemTypes.NOT_FOUND,
          title: ProblemTitles.NOT_FOUND,
        };
      case exception instanceof ConflictException:
        return {
          type: ProblemTypes.CONFLICT,
          title: ProblemTitles.CONFLICT,
        };
      case exception instanceof ServiceUnavailableException:
        return {
          type: ProblemTypes.SERVICE_UNAVAILABLE,
          title: ProblemTitles.SERVICE_UNAVAILABLE,
        };
      case exception instanceof InternalServerErrorException:
        return {
          type: ProblemTypes.INTERNAL_SERVER_ERROR,
          title: ProblemTitles.INTERNAL_SERVER_ERROR,
        };
      default: {
        // Fallback based on HTTP status code
        const status = exception.getStatus();
        if (status >= 500) {
          return {
            type: ProblemTypes.INTERNAL_SERVER_ERROR,
            title: ProblemTitles.INTERNAL_SERVER_ERROR,
          };
        } else if (status === 400) {
          return {
            type: ProblemTypes.BAD_REQUEST,
            title: ProblemTitles.BAD_REQUEST,
          };
        } else if (status === 404) {
          return {
            type: ProblemTypes.NOT_FOUND,
            title: ProblemTitles.NOT_FOUND,
          };
        } else {
          return {
            type: ProblemTypes.BAD_REQUEST,
            title: ProblemTitles.BAD_REQUEST,
          };
        }
      }
    }
  }

  private extractRequestContext(request: FastifyRequest) {
    // Extract user information from JWT claims if available
    const user = (request as unknown as AuthenticatedRequest).user;
    const userId = user?.id || 'unknown';

    return {
      method: request.method,
      host: request.host,
      path: request.originalUrl,
      userId,
      timestamp: new Date().toISOString(),
    };
  }
}
