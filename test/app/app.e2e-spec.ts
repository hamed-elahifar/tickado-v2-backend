import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { PusherService } from '../../src/modules/common/push-notifications/pusher.service';

type AppModuleType = typeof import('../../src/app.module');

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    process.env.S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost';
    process.env.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'tickado-test';
    process.env.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'test-access-key';
    process.env.S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'test-secret-key';

    const { AppModule }: AppModuleType = await import('../../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PusherService)
      .useValue({
        trigger: jest.fn(),
        triggerToUser: jest.fn(),
        triggerToGame: jest.fn(),
        triggerToChannel: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });
});
