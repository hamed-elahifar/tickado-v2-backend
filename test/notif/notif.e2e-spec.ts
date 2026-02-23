import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

jest.mock('pusher', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      trigger: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

type AppModuleType = typeof import('../../src/app.module');

describe('NotifController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  let userOneId: string;
  let userOneToken: string;
  let userTwoId: string;
  let userTwoToken: string;

  const userOne = {
    name: 'Notif User One',
    phone: '+989123456781',
  };

  const userTwo = {
    name: 'Notif User Two',
    phone: '+989123456782',
  };

  const getAccessToken = async (phone: string): Promise<string> => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        phone,
        code: '1234',
      })
      .expect(201);

    return response.body.accessToken;
  };

  const createUserAndLogin = async (payload: {
    name: string;
    phone: string;
  }): Promise<{ id: string; token: string }> => {
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(payload)
      .expect(200);

    const token = await getAccessToken(payload.phone);

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    return {
      id: meResponse.body._id,
      token,
    };
  };

  const createNotification = async (
    token: string,
    data: {
      userId: string;
      title: string;
      message: string;
      metadata?: Record<string, any>;
    },
  ) => {
    return request(app.getHttpServer())
      .post('/notifs')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(201);
  };

  beforeAll(async () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    process.env.PORT = process.env.PORT || '3000';
    process.env.CLIENT_PORT = process.env.CLIENT_PORT || '3001';

    process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
    process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
    process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
    process.env.REDIS_TTL = process.env.REDIS_TTL || '60';

    process.env.MONGO_URL =
      process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tickado_test';
    process.env.MONGO_DEBUG = process.env.MONGO_DEBUG || 'false';

    process.env.JWT_SECRET = process.env.JWT_SECRET || '123123';
    process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'tickado';
    process.env.JWT_ISSUER = process.env.JWT_ISSUER || 'tickado-test';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

    process.env.SMS_API_URL = process.env.SMS_API_URL || 'http://localhost';
    process.env.SMS_API_KEY = process.env.SMS_API_KEY || 'test-key';
    process.env.SMS_SENDER = process.env.SMS_SENDER || 'test-sender';

    process.env.PUSHER_APP_ID = process.env.PUSHER_APP_ID || 'test-app-id';
    process.env.PUSHER_KEY = process.env.PUSHER_KEY || 'test-key';
    process.env.PUSHER_SECRET = process.env.PUSHER_SECRET || 'test-secret';
    process.env.PUSHER_CLUSTER = process.env.PUSHER_CLUSTER || 'test-cluster';

    process.env.NESHAN_API_KEY = process.env.NESHAN_API_KEY || 'test-neshan';

    const { AppModule }: AppModuleType = await import('../../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    await connection.dropDatabase();

    const firstUser = await createUserAndLogin(userOne);
    userOneId = firstUser.id;
    userOneToken = firstUser.token;

    const secondUser = await createUserAndLogin(userTwo);
    userTwoId = secondUser.id;
    userTwoToken = secondUser.token;
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }

    if (app) {
      await app.close();
    }
  });

  describe('/notifs (POST)', () => {
    it('should create a notification for a user', async () => {
      const response = await createNotification(userOneToken, {
        userId: userOneId,
        title: 'Ticket updated',
        message: 'Your ticket moved to in-progress.',
        metadata: { ticketId: 'ticket-1' },
      });

      expect(response.body).toHaveProperty('_id');
      expect(response.body.userId).toBe(userOneId);
      expect(response.body.title).toBe('Ticket updated');
      expect(response.body.message).toBe('Your ticket moved to in-progress.');
      expect(response.body.isRead).toBe(false);
      expect(response.body.readAt).toBeNull();
    });
  });

  describe('/notifs/me (GET)', () => {
    it('should return only authenticated user notifications', async () => {
      await createNotification(userOneToken, {
        userId: userOneId,
        title: 'One-1',
        message: 'User one message 1',
      });

      await createNotification(userOneToken, {
        userId: userOneId,
        title: 'One-2',
        message: 'User one message 2',
      });

      await createNotification(userTwoToken, {
        userId: userTwoId,
        title: 'Two-1',
        message: 'User two message 1',
      });

      const response = await request(app.getHttpServer())
        .get('/notifs/me')
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(2);
      response.body.forEach((item: { userId: string }) => {
        expect(item.userId).toBe(userOneId);
      });
    });

    it('should filter by read notifications', async () => {
      const firstNotif = await createNotification(userOneToken, {
        userId: userOneId,
        title: 'Unread candidate',
        message: 'Will be marked as read',
      });

      await createNotification(userOneToken, {
        userId: userOneId,
        title: 'Unread stays unread',
        message: 'Still unread',
      });

      await request(app.getHttpServer())
        .patch(`/notifs/me/${firstNotif.body._id}/read`)
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      const readResponse = await request(app.getHttpServer())
        .get('/notifs/me')
        .query({ isRead: true })
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      expect(readResponse.body).toHaveLength(1);
      expect(readResponse.body[0].title).toBe('Unread candidate');
      expect(readResponse.body[0].isRead).toBe(true);
    });
  });

  describe('read/unread state endpoints', () => {
    it('should mark one notification as read and unread', async () => {
      const created = await createNotification(userOneToken, {
        userId: userOneId,
        title: 'State change',
        message: 'Track read state',
      });

      const markReadResponse = await request(app.getHttpServer())
        .patch(`/notifs/me/${created.body._id}/read`)
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      expect(markReadResponse.body.isRead).toBe(true);
      expect(markReadResponse.body.readAt).toBeTruthy();

      const markUnreadResponse = await request(app.getHttpServer())
        .patch(`/notifs/me/${created.body._id}/unread`)
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      expect(markUnreadResponse.body.isRead).toBe(false);
      expect(markUnreadResponse.body.readAt).toBeNull();
    });

    it('should mark all notifications as read for authenticated user only', async () => {
      await createNotification(userOneToken, {
        userId: userOneId,
        title: 'User one notif 1',
        message: 'Unread one',
      });
      await createNotification(userOneToken, {
        userId: userOneId,
        title: 'User one notif 2',
        message: 'Unread two',
      });
      await createNotification(userTwoToken, {
        userId: userTwoId,
        title: 'User two notif',
        message: 'Should remain unread',
      });

      const markAllResponse = await request(app.getHttpServer())
        .patch('/notifs/me/read-all')
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      expect(markAllResponse.body.modifiedCount).toBe(2);

      const userOneUnreadCount = await request(app.getHttpServer())
        .get('/notifs/me/unread-count')
        .set('Authorization', `Bearer ${userOneToken}`)
        .expect(200);

      const userTwoUnreadCount = await request(app.getHttpServer())
        .get('/notifs/me/unread-count')
        .set('Authorization', `Bearer ${userTwoToken}`)
        .expect(200);

      expect(userOneUnreadCount.body.unreadCount).toBe(0);
      expect(userTwoUnreadCount.body.unreadCount).toBe(1);
    });
  });
});
