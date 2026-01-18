import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from '@/modules/assets/assets.controller';
import { AssetsService } from '@/modules/assets/assets.service';

describe('AssetsController', () => {
  let controller: AssetsController;

  const mockAssetsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [{ provide: AssetsService, useValue: mockAssetsService }],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
