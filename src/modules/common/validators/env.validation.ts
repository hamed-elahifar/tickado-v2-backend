import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  validateSync,
} from 'class-validator';
import { IsNumberOrString } from './string-or-number.validator';
import { Environment } from '../enums/environments.enum';

class EnvironmentVariables {
  // APP
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsNumber()
  CLIENT_PORT: number;

  // REDIS
  @IsString()
  REDIS_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  // DB
  @IsString()
  MONGO_URL: string;

  @IsBoolean()
  MONGO_DEBUG: boolean;

  @IsNumber()
  REDIS_TTL: number;

  // JWT
  @IsDefined()
  @Validate(IsNumberOrString)
  JWT_SECRET: number | string;

  @IsString()
  JWT_AUDIENCE: string;

  @IsString()
  JWT_ISSUER: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  // SMS
  @IsString()
  SMS_API_URL: string;

  @IsString()
  SMS_API_KEY: string;

  @IsString()
  SMS_SENDER: string;

  // PUSHER
  @IsString()
  PUSHER_APP_ID: string;

  @IsString()
  PUSHER_KEY: string;

  @IsString()
  PUSHER_SECRET: string;

  @IsString()
  PUSHER_CLUSTER: string;

  // TELEGRAM
  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_CHAT_ID?: string;

  // S3
  @IsString()
  S3_ENDPOINT: string;

  @IsString()
  S3_BUCKET_NAME: string;

  @IsString()
  S3_ACCESS_KEY: string;

  @IsString()
  S3_SECRET_KEY: string;

  @IsString()
  NESHAN_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
