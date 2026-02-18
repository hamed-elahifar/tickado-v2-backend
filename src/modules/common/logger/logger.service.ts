import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ context, level, message, timestamp, ...meta }) => {
                return `${timestamp} [${context}] ${level}: ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                }`;
              },
            ),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, ...meta: any[]) {
    this.logger.info(message, { context: this.context, ...meta });
  }

  error(message: string, trace?: string, ...meta: any[]) {
    this.logger.error(message, { context: this.context, trace, ...meta });
  }

  warn(message: string, ...meta: any[]) {
    this.logger.warn(message, { context: this.context, ...meta });
  }

  debug(message: string, ...meta: any[]) {
    this.logger.debug(message, { context: this.context, ...meta });
  }

  verbose(message: string, ...meta: any[]) {
    this.logger.verbose(message, { context: this.context, ...meta });
  }
}
