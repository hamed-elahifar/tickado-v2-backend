// ===================== ﷽

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './modules/common/filters';
import { ResponseInterceptor } from './modules/common/interceptors';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // Enable CORS for all origins
  });
  app.set('trust proxy', 1);
  app.use(compression());

  // Get services from the DI container
  const globalExceptionFilter = app.get(GlobalExceptionFilter);

  // Global exception filter to ensure all errors return JSON and send to Telegram
  app.useGlobalFilters(globalExceptionFilter);

  // Global response interceptor to ensure consistent JSON response format
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('The Users API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();

  const configService = app.get<ConfigService>(ConfigService);
  const port: number = +configService.getOrThrow<string>('PORT');

  await app.listen(port, () => {
    logger.log(`
      
████████╗██╗ ██████╗██╗  ██╗ █████╗ ██████╗  ██████╗     ██╗   ██╗██████╗ 
╚══██╔══╝██║██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔═══██╗    ██║   ██║╚════██╗
   ██║   ██║██║     █████╔╝ ███████║██║  ██║██║   ██║    ██║   ██║ █████╔╝
   ██║   ██║██║     ██╔═██╗ ██╔══██║██║  ██║██║   ██║    ╚██╗ ██╔╝██╔═══╝ 
   ██║   ██║╚██████╗██║  ██╗██║  ██║██████╔╝╚██████╔╝     ╚████╔╝ ███████╗
   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝       ╚═══╝  ╚══════╝
    `);
  });

  logger.log(`App Running On Port: ${await app.getUrl()}`);
}

bootstrap()
  .then()
  .catch((err) => console.error(err));
