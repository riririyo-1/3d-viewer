import { Test, TestingModule } from '@nestjs/testing';
import { SharesService } from '../../../../src/modules/shares/shares.service';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MinioService } from '../../../../src/infrastructure/storage/minio.service';

const mockPrismaService = {
  shareLink: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'MINIO_ENDPOINT') return 'localhost';
    if (key === 'MINIO_PORT') return '9000';
    return null;
  }),
};

const mockMinioService = {
  client: {},
  bucket: 'test-bucket',
};

describe('SharesService', () => {
  let service: SharesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MinioService, useValue: mockMinioService },
      ],
    }).compile();

    service = module.get<SharesService>(SharesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of shares', async () => {
      const result = [{ id: '1', shareId: 'test' }];
      mockPrismaService.shareLink.findMany.mockResolvedValue(result);

      expect(await service.findAll('user-1')).toBe(result);
      expect(mockPrismaService.shareLink.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { asset: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
