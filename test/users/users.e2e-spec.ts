import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { CreateUserDto } from '../../src/modules/users/dto';
import { PusherService } from '../../src/modules/common/push-notifications/pusher.service';
import { RolesEnum } from '../../src/modules/auth/enums/roles.enum';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const createAuthenticatedUser = async (
    phone: string,
    role?: RolesEnum,
  ): Promise<{ accessToken: string; userId: string }> => {
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({
        name: 'Authenticated User',
        phone,
      })
      .expect(200);

    if (role) {
      await connection.collection('users').updateOne(
        { phone },
        {
          $set: {
            roles: role,
          },
        },
      );
    }

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

  describe('/users (POST)', () => {
    it('should create a new user', async () => {
      const { accessToken } = await createAuthenticatedUser('+989120001000');

      const createUserDto: CreateUserDto = {
        name: 'Test User',
        phone: '+989120001001',
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('_id');
          expect(response.body.name).toBe(createUserDto.name);
          expect(response.body.phone).toBe(createUserDto.phone);
          expect(response.body).toHaveProperty('phoneValidation');
          expect(response.body).toHaveProperty('createdAt');
          expect(response.body).toHaveProperty('updatedAt');
        });
    });

    xit('should not create a user with duplicate phone number', async () => {
      const { accessToken } = await createAuthenticatedUser('+989120001002');

      const createUserDto: CreateUserDto = {
        name: 'Test User',
        phone: '+989120001003',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createUserDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createUserDto)
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should get all users with pagination', async () => {
      const { accessToken } = await createAuthenticatedUser('+989120001010');

      const users = [
        { name: 'User 1', phone: '+989120001011' },
        { name: 'User 2', phone: '+989120001012' },
        { name: 'User 3', phone: '+989120001013' },
      ];

      for (const user of users) {
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(user)
          .expect(201);
      }

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ limit: 2, offset: 0 })
        .expect(200)
        .expect((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body).toHaveLength(2);
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('phone');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get a user by id', async () => {
      const { accessToken } = await createAuthenticatedUser(
        '+989120001020',
        RolesEnum.ADMIN,
      );

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test User',
          phone: '+989120001021',
        })
        .expect(201);

      const userId = createResponse.body._id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body._id).toBe(userId);
          expect(response.body.name).toBe('Test User');
          expect(response.body.phone).toBe('+989120001021');
        });
    });

    it('should return 404 for non-existent user', async () => {
      const { accessToken } = await createAuthenticatedUser(
        '+989120001022',
        RolesEnum.ADMIN,
      );

      return request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for invalid object id', async () => {
      const { accessToken } = await createAuthenticatedUser(
        '+989120001023',
        RolesEnum.ADMIN,
      );

      return request(app.getHttpServer())
        .get('/users/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      const { accessToken } = await createAuthenticatedUser('+989120001030');

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test User',
          phone: '+989120001031',
        })
        .expect(201);

      const userId = createResponse.body._id;

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated User',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body._id).toBe(userId);
          expect(response.body.name).toBe('Updated User');
          expect(response.body.phone).toBe('+989120001031');
        });
    });

    it('should return 404 for non-existent user update', async () => {
      const { accessToken } = await createAuthenticatedUser('+989120001032');

      return request(app.getHttpServer())
        .patch('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated User',
        })
        .expect(404);
    });
  });
});
