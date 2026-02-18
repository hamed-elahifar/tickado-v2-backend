import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { CreateUserDto } from '../../src/modules/users/dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    // Set NODE_ENV to test before loading the app module
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    // Clean the users collection before each test
    await connection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        phone: '+1234567890',
      };

      return request(app.getHttpServer())
        .post('/users')
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
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        phone: '+1234567890',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      // Try to create second user with same phone
      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should get all users with pagination', async () => {
      // Create test users
      const users = [
        { name: 'User 1', phone: '+1234567891' },
        { name: 'User 2', phone: '+1234567892' },
        { name: 'User 3', phone: '+1234567893' },
      ];

      for (const user of users) {
        await request(app.getHttpServer())
          .post('/users')
          .send(user)
          .expect(201);
      }

      // Test pagination
      return request(app.getHttpServer())
        .get('/users')
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
      // Create a test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          phone: '+1234567890',
        })
        .expect(201);

      const userId = createResponse.body._id;

      // Get the user by id
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body._id).toBe(userId);
          expect(response.body.name).toBe('Test User');
          expect(response.body.phone).toBe('+1234567890');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011') // Valid MongoDB ObjectId that doesn't exist
        .expect(404);
    });

    it('should return 404 for invalid object id', () => {
      return request(app.getHttpServer()).get('/users/invalid-id').expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      // Create a test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          phone: '+1234567890',
        })
        .expect(201);

      const userId = createResponse.body._id;

      // Update the user
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          name: 'Updated User',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body._id).toBe(userId);
          expect(response.body.name).toBe('Updated User');
          expect(response.body.phone).toBe('+1234567890');
        });
    });

    it('should return 404 for non-existent user update', () => {
      return request(app.getHttpServer())
        .patch('/users/507f1f77bcf86cd799439011')
        .send({
          name: 'Updated User',
        })
        .expect(404);
    });
  });
});
