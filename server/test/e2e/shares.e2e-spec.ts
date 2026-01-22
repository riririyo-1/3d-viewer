import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('SharesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string;
  let userId: string;
  let assetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Cleanup
    await prisma.shareLink.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();

    // Create User
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'password',
        plan: 'free',
        storageLimit: 1000000,
      },
    });
    userId = user.id;

    // Generate Token (Mock Login)
    // We can use AuthService, or just sign directly if we know the secret.
    // Easier to rely on AuthService or just direct sign if we have access.
    // But getting AuthService is better.
    // Using a simple workaround: Reuse AuthController login or just manual sign.
    // Let's manually sign for speed if we can get config.
    // Actually, let's just make a verified user.
    // Or better, use the /auth/login endpoint if available.
    // But we manually created user, so password hashing might be issue if we didn't hash it.
    // So let's use direct DB insert + manual token generation.
    // Note: ConfigService is global.
    const secret = process.env.JWT_SECRET || 'super-secret';
    token = jwtService.sign({ sub: user.id, email: user.email }, { secret });

    // Create Asset
    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        name: 'test-box.glb',
        type: 'glb',
        size: 1024,
        storagePath: 'users/' + user.id + '/test-box.glb',
      },
    });
    assetId = asset.id;
  });

  afterAll(async () => {
    await prisma.shareLink.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/shares (POST) - should create a share link', async () => {
    return request(app.getHttpServer())
      .post('/shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        assetId: assetId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('shareId');
        expect(res.body.shareId).toHaveLength(12);
        expect(res.body.assetId).toBe(assetId);
      });
  });

  let createdShareId: string;

  it('/shares (GET) - should list share links', async () => {
    const res = await request(app.getHttpServer())
      .get('/shares')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    createdShareId = res.body[0].shareId;
  });

  it('/shared/:shareId (GET) - should get public share info', async () => {
    return request(app.getHttpServer())
      .get(`/shared/${createdShareId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('shareId', createdShareId);
        // Should verify sensitive info is NOT present if any
      });
  });

  // Optional: Test password protection
  it('should support password protection', async () => {
    // Create password protected share
    const res = await request(app.getHttpServer())
      .post('/shares')
      .set('Authorization', `Bearer ${token}`)
      .send({
        assetId: assetId,
        password: 'secure-password',
      })
      .expect(201);

    const shareId = res.body.shareId;

    // Verify password endpoint
    await request(app.getHttpServer())
      .post(`/shared/${shareId}/verify`)
      .send({ password: 'wrong-password' })
      //.expect(200) // Controller returns { valid: false }? Or throws?
      // Service `verifyPassword` returns boolean. Controller returns { valid: boolean }
      .expect(201) // POST default
      .expect((res) => {
        expect(res.body.valid).toBe(false);
      });

    await request(app.getHttpServer())
      .post(`/shared/${shareId}/verify`)
      .send({ password: 'secure-password' })
      .expect(201)
      .expect((res) => {
        expect(res.body.valid).toBe(true);
      });
  });
});
