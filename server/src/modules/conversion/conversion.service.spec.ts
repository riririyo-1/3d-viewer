import { Test, TestingModule } from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('ConversionService', () => {
  let service: ConversionService;

  const mockPrismaService = {
    conversionJob: {
      create: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getQueueToken('conversion'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ConversionService>(ConversionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job in Db and Queue', async () => {
      const userId = 'user1';
      const assetId = 'asset1';
      const storagePath = 'user1/asset1/model.obj';
      const originalName = 'model.obj';

      mockPrismaService.conversionJob.create.mockResolvedValue({ id: 'job1' });
      mockQueue.add.mockResolvedValue({ id: 'job1' });

      await service.createJob(userId, assetId, storagePath, originalName);

      expect(mockPrismaService.conversionJob.create).toHaveBeenCalledWith({
        data: {
          userId,
          originalName,
          originalType: 'obj',
          convertedName: 'model.glb',
          convertedType: 'glb',
          status: 'pending',
        },
      });
      expect(mockQueue.add).toHaveBeenCalledWith('convert', {
        conversionJobId: 'job1',
        assetId,
        storagePath,
        outputFormat: 'glb',
      });
    });
  });
});
