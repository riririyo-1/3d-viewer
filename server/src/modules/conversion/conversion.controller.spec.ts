import { Test, TestingModule } from '@nestjs/testing';
import { ConversionController } from './conversion.controller';
import { AssetsService } from '../assets/assets.service';
import { ConversionService } from './conversion.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('ConversionController', () => {
  let controller: ConversionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversionController],
      providers: [
        {
          provide: AssetsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ConversionService,
          useValue: {
            createJob: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            conversionJob: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<ConversionController>(ConversionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
