import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { MongoError } from 'mongodb';
import {
  I18nContext,
  I18nValidationError,
  I18nValidationException,
} from 'nestjs-i18n';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly telegramService: TelegramService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;
    let code: string | undefined;

    if (exception instanceof I18nValidationException) {
      status = exception.getStatus();
      error = exception.name;
      message = this.formatI18nValidationErrors(exception.errors ?? []);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
          statusCode?: number;
        };
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      } else {
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exception.message;
        error = exception.name;
      }

      // Handle throttler exceptions specifically
      if (exception instanceof ThrottlerException) {
        error = 'Too Many Requests';
        code = 'THROTTLE_LIMIT_EXCEEDED';
      }
    } else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      if (exception.code === 11000) {
        message = 'Duplicate entry detected';
        code = 'DUPLICATE_KEY_ERROR';
      } else {
        message = 'Database operation failed';
        code = 'DATABASE_ERROR';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      error = 'Internal Server Error';
      code = 'INTERNAL_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error occurred';
      error = 'Internal Server Error';
      code = 'UNKNOWN_ERROR';
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      ...(code && { code }),
      timestamp: new Date().toISOString(),
    };

    // Only log and notify for server errors (5xx) - these are unexpected errors
    // Client errors (4xx) like 404, 400, 401, etc. are expected and should not clutter logs
    if (status >= 500) {
      // Log the error for debugging
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${error}`,
        exception instanceof Error ? exception.stack : String(exception),
      );

      // Send error notification to Telegram for server errors only
      this.sendTelegramNotification(exception, request, status, error).catch(
        (telegramError) => {
          this.logger.warn(
            'Failed to send Telegram notification:',
            telegramError,
          );
        },
      );
    }

    response.status(status).json(errorResponse);
  }

  private formatI18nValidationErrors(errors: I18nValidationError[]): string[] {
    const translatedErrors = this.translateI18nValidationErrors(errors);
    return this.collectConstraintMessages(translatedErrors);
  }

  private translateI18nValidationErrors(
    errors: I18nValidationError[],
  ): I18nValidationError[] {
    const i18n = I18nContext.current();

    return errors.map((error) => {
      const children = this.translateI18nValidationErrors(error.children ?? []);
      const constraints = this.translateI18nConstraints(
        error,
        error.constraints ?? {},
        i18n,
      );

      return {
        ...error,
        children,
        constraints,
      };
    });
  }

  private translateI18nConstraints(
    error: I18nValidationError,
    constraints: Record<string, string>,
    i18n?: I18nContext,
  ): Record<string, string> {
    if (!i18n) return constraints;

    return Object.keys(constraints).reduce(
      (result, key) => {
        const rawValue = constraints[key];
        const [translationKey, argsString] = rawValue.split('|');
        if (!argsString) {
          result[key] = rawValue;
          return result;
        }

        try {
          const parsedArgs = this.safeParseArgs(argsString);
          const constraintsArgs = this.normalizeConstraintsArgs(
            parsedArgs?.constraints,
            constraints,
          );
          const translationArgs: Record<string, unknown> = {
            property: error.property,
            value: error.value as unknown,
            target: error.target as unknown,
            contexts: error.contexts as unknown,
            ...(parsedArgs ? parsedArgs.args : {}),
            constraints: constraintsArgs,
          };

          result[key] = i18n.service.translate(translationKey, {
            lang: i18n.lang,
            args: translationArgs,
          });
        } catch {
          result[key] = rawValue;
        }

        return result;
      },
      {} as Record<string, string>,
    );
  }

  private collectConstraintMessages(errors: I18nValidationError[]): string[] {
    const messages: string[] = [];

    const walk = (items: I18nValidationError[]) => {
      for (const item of items) {
        if (item.constraints) {
          messages.push(...Object.values(item.constraints));
        }
        if (item.children?.length) {
          walk(item.children);
        }
      }
    };

    walk(errors);
    return messages;
  }

  private safeParseArgs(
    raw: string,
  ): { args: Record<string, unknown>; constraints?: unknown } | null {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      const record = parsed as Record<string, unknown>;
      const { constraints, ...rest } = record;
      return { args: rest, constraints };
    } catch {
      return null;
    }
  }

  private normalizeConstraintsArgs(
    rawConstraints: unknown,
    fallback: Record<string, string>,
  ): Record<string, string> {
    if (Array.isArray(rawConstraints)) {
      const normalized: Record<string, string> = {};
      rawConstraints.forEach((value, index) => {
        normalized[index.toString()] = String(value);
      });
      return normalized;
    }

    if (rawConstraints && typeof rawConstraints === 'object') {
      return Object.entries(rawConstraints as Record<string, unknown>).reduce(
        (acc: Record<string, string>, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {},
      );
    }

    return fallback;
  }

  private async sendTelegramNotification(
    exception: unknown,
    request: Request,
    status: number,
    error: string,
  ): Promise<void> {
    if (!(exception instanceof Error)) return;

    const context = `${request.method} ${request.url}`;
    const additionalData = {
      statusCode: status,
      errorType: error,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      timestamp: new Date().toISOString(),
    };

    await this.telegramService.sendErrorNotification(
      exception,
      context,
      additionalData,
    );
  }
}
