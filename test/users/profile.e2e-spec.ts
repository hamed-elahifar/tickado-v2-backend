import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { PusherService } from '../../src/modules/common/push-notifications/pusher.service';

describe('UsersProfileController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const createAuthenticatedUser = async (phone: string) => {
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({
        name: 'Profile Owner',
        phone,
      })
      .expect(200);

    const signInResponse = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        phone,
        code: '1234',
      })
      .expect(201);

    const accessToken: string = signInResponse.body.accessToken;

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    return { accessToken, userId: meResponse.body._id as string };
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const { AppModule } = await import('../../src/app.module');

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
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    await connection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    if (app) {
      await app.close();
    }
  });

  describe('/users/:id/profile (POST)', () => {
    it('should create a profile for a user', async () => {
      const { userId, accessToken } =
        await createAuthenticatedUser('+989120000001');
      const profile = {
        bio: 'Software Engineer',
        interests: ['coding', 'hiking'],
      };

      return request(app.getHttpServer())
        .post(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ profile })
        .expect(201)
        .expect((response) => {
          expect(response.body).toEqual(profile);
        });
    });

    it('should return 409 when profile already exists', async () => {
      const { userId, accessToken } =
        await createAuthenticatedUser('+989120000002');

      await request(app.getHttpServer())
        .post(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          profile: { bio: 'Initial bio' },
        })
        .expect(201);

      return request(app.getHttpServer())
        .post(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          profile: { bio: 'Second bio' },
        })
        .expect(409);
    });
  });

  describe('/users/:id/profile (GET)', () => {
    it('should get an existing profile', async () => {
      const { userId, accessToken } =
        await createAuthenticatedUser('+989120000003');
      const profile = { bio: 'Backend Developer' };

      await request(app.getHttpServer())
        .post(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ profile })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual(profile);
        });
    });

    it('should return 404 for non-existent user', async () => {
      const { accessToken } = await createAuthenticatedUser('+989120000006');

      return request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/users/:id/profile (PATCH)', () => {
    it('should merge profile fields when updating', async () => {
      const { userId, accessToken } =
        await createAuthenticatedUser('+989120000004');

      await request(app.getHttpServer())
        .post(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          profile: {
            bio: 'Engineer',
            city: 'Tehran',
          },
        })
        .expect(201);

      return request(app.getHttpServer())
        .patch(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          profile: {
            bio: 'Senior Engineer',
            website: 'https://example.com',
          },
        })
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({
            bio: 'Senior Engineer',
            city: 'Tehran',
            website: 'https://example.com',
          });
        });
    });
  });

  describe('/users/:id/profile (DELETE)', () => {
    it('should remove profile and return empty object', async () => {
      const { userId, accessToken } =
        await createAuthenticatedUser('+989120000005');

      await request(app.getHttpServer())
        .post(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          profile: { bio: 'To be removed' },
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({});
        });

      return request(app.getHttpServer())
        .get(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toEqual({});
        });
    });
  });
});
