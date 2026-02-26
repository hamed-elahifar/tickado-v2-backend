import { ExecutionContext, Module } from '@nestjs/common';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './modules/common/validators/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { SmsModule } from './modules/common/sms/sms.module';
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { AnswerModule } from './modules/answer/answer.module';
import { TicketModule } from './modules/ticketing/ticket.module';
import { AuthModule } from './modules/auth/auth.module';
import { redisModule } from './modules/common/redis/redis-module.config';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { LoggerModule } from './modules/common/logger/logger.module';
import { CustomLogger } from './modules/common/logger/logger.service';
import { PushNotificationsModule } from './modules/common/push-notifications/push-notifications.module';
import { TelegramModule } from './modules/common/telegram/telegram.module';
import { GlobalExceptionFilter } from './modules/common/filters';
import { Request } from 'express';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { NotifModule } from './modules/notif/notif.module';
import { S3Module } from './modules/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URL'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';

        const throttlerStorage = isProduction
          ? new ThrottlerStorageRedisService(
              config.getOrThrow<string>('REDIS_URL'),
            )
          : undefined;

        return {
          throttlers: isProduction
            ? [{ name: 'default', limit: 20, ttl: seconds(60) }]
            : [],
          storage: throttlerStorage,
          errorMessage: 'Wow! Slow down.',
          getTracker: (req: Request, context: ExecutionContext): string => {
            const httpRequest =
              context.switchToHttp().getRequest<Request>() ?? req;

            const forwardedForHeader = httpRequest.headers['x-forwarded-for'];
            const forwardedIp: string = Array.isArray(forwardedForHeader)
              ? forwardedForHeader[0]
              : (forwardedForHeader?.split(',')[0]?.trim() ?? '');

            const directIp: string =
              typeof httpRequest.ip === 'string' ? httpRequest.ip : '';

            const tracker = forwardedIp || directIp || 'anonymous';

            return tracker.startsWith('::ffff:') ? tracker.slice(7) : tracker;
          },
          generateKey: (
            context: ExecutionContext,
            trackerString: string,
            throttlerName: string,
          ) => {
            const className = context.getClass()?.name ?? 'unknownClass';
            const handlerName = context.getHandler()?.name ?? 'unknownHandler';

            return [throttlerName, trackerString, className, handlerName]
              .filter(Boolean)
              .join(':');
          },
        };
      },
    }),
    redisModule,
    UsersModule,
    QuestionnaireModule,
    AnswerModule,
    TicketModule,
    AuthModule,
    SmsModule,
    LoggerModule,
    PushNotificationsModule,
    TelegramModule,
    NotifModule,
    S3Module,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    CustomLogger,
    GlobalExceptionFilter,
  ],
})
export class AppModule {}
