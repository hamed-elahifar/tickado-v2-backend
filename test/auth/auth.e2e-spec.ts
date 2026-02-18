import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../../src/modules/users/dto';
import { LogInDto } from '../../src/modules/auth/dto/login.dto';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let configService: ConfigService;

  const testUser: CreateUserDto = {
    name: 'Test User',
    phone: '+1234567890',
  };

  const loginDto: LogInDto = {
    phone: testUser.phone,
    code: '123123', // Master code for testing
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    configService = moduleFixture.get<ConfigService>(ConfigService);

    await app.init();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await app.close();
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  describe('/auth/sign-up (POST)', () => {
    it('should create a new user and return success message', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(testUser)
        .expect(200);

      expect(response.text).toContain('verification code has been send');
    });

    xit('should handle existing user and send new verification code', async () => {
      // First signup
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(testUser)
        .expect(200);

      // Second signup with same phone
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(testUser)
        .expect(200);

      expect(response.text).toBeDefined();
    });

    xit('should handle invalid phone number format', async () => {
      const invalidUser = {
        ...testUser,
        phone: 'invalid-phone',
      };

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(invalidUser)
        .expect(400);
    });
  });

  xdescribe('/auth/sign-in (POST)', () => {
    beforeEach(async () => {
      // Create a user before testing sign-in
      await request(app.getHttpServer()).post('/auth/sign-up').send(testUser);
    });

    it('should authenticate user with master code and return JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should fail with incorrect verification code', async () => {
      const wrongLoginDto = {
        ...loginDto,
        code: '000000',
      };

      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(wrongLoginDto)
        .expect(401);
    });

    it('should fail with non-existent phone number', async () => {
      const nonExistentLoginDto = {
        phone: '+9999999999',
        code: '123123',
      };

      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(nonExistentLoginDto)
        .expect(401);
    });
  });

  xdescribe('/auth/me (GET)', () => {
    let jwtToken: string;

    beforeEach(async () => {
      // Create user and get JWT token
      await request(app.getHttpServer()).post('/auth/sign-up').send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto);

      jwtToken = loginResponse.body.accessToken;
    });

    it('should return user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.phone).toBe(testUser.phone);
    });

    it('should fail without JWT token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  xdescribe('Rate Limiting', () => {
    it('should limit sign-up attempts', async () => {
      // Make multiple requests quickly
      for (let i = 0; i < 2; i++) {
        const status = i === 0 ? 200 : 429;
        await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send(testUser)
          .expect(status);
      }
    });

    it('should limit sign-in attempts', async () => {
      // Create user first
      await request(app.getHttpServer()).post('/auth/sign-up').send(testUser);

      // Make multiple sign-in attempts
      for (let i = 0; i < 4; i++) {
        const status = i < 3 ? 201 : 429;
        await request(app.getHttpServer())
          .post('/auth/sign-in')
          .send(loginDto)
          .expect(status);
      }
    });
  });
});
