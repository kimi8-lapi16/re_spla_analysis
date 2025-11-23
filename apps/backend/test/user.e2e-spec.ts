import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('User API (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  const testUser = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({
      where: {
        email: testUser.email,
      },
    });
    await app.close();
  });

  describe('POST /users', () => {
    beforeEach(async () => {
      await prismaService.user.deleteMany({
        where: {
          email: testUser.email,
        },
      });
    });

    it('should create a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
      expect(response.body.user).not.toHaveProperty('password');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken');
      expect(cookies[0]).toContain('HttpOnly');

      const createdUser = await prismaService.user.findUnique({
        where: { email: testUser.email },
        include: { secret: true },
      });
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(testUser.email);
      expect(createdUser?.secret?.password).toBeDefined();
      expect(createdUser?.secret?.password).not.toBe(testUser.password);
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toBe('Email already exists');
    });

    it('should return 400 with missing name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 with missing email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: testUser.name,
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 with missing password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: testUser.name,
          email: testUser.email,
        })
        .expect(400);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: testUser.name,
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 with password shorter than 8 characters', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: testUser.name,
          email: testUser.email,
          password: 'short',
        })
        .expect(400);
    });

    it('should reject extra fields', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
          extraField: 'should be rejected',
        })
        .expect(400);
    });

    it('should return 400 with empty name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: '',
          email: testUser.email,
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 with empty email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: testUser.name,
          email: '',
          password: testUser.password,
        })
        .expect(400);
    });
  });
});
