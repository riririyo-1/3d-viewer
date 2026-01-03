import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MinioService } from '../../infrastructure/storage/minio.service';
import { ConfigService } from '@nestjs/config';
import { ConversionService } from '../conversion/conversion.service';
import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';

// Mock Minio Client
const mockMinioClient = {
  putObject: jest.fn(),
  presignedGetObject: jest.fn(),
  presignedPutObject: jest.fn(),
  removeObject: jest.fn(),
};

describe('AssetsService', () => {
  let service: AssetsService;

  const mockPrismaService = {
    asset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockMinioService = {
    client: mockMinioClient,
    bucket: 'test-bucket',
    ensureBucket: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockConversionService = {
    createJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MinioService, useValue: mockMinioService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ConversionService, useValue: mockConversionService },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should upload file and create asset', async () => {
      const userId = 'user1';
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'model.obj',
        encoding: '7bit',
        mimetype: 'model/obj',
        buffer: Buffer.from('test'),
        size: 4,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };

      mockMinioClient.putObject.mockResolvedValue('etag');
      mockPrismaService.asset.create.mockResolvedValue({
        id: 'asset1',
        userId,
        name: 'model.obj',
        type: 'obj',
        size: BigInt(4),
        storagePath: 'user1/uuid/model.obj',
        thumbnailUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockConversionService.createJob.mockResolvedValue({});

      const result = await service.create(userId, file);

      expect(mockMinioClient.putObject).toHaveBeenCalled();
      expect(mockPrismaService.asset.create).toHaveBeenCalled();
      expect(mockConversionService.createJob).toHaveBeenCalled();
      expect(result.id).toEqual('asset1');
    });

    it('should throw error for unsupported type', async () => {
      const userId = 'user1';
      const file = {
        originalname: 'model.txt',
      } as Express.Multer.File;

      await expect(service.create(userId, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
