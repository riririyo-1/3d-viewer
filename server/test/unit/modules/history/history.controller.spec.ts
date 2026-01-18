import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from '@/modules/history/history.controller';
import { HistoryService } from '@/modules/history/history.service';

describe('HistoryController', () => {
  let controller: HistoryController;

  const mockHistoryService = {
    findAll: jest.fn(),
    addRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryController],
      providers: [{ provide: HistoryService, useValue: mockHistoryService }],
    }).compile();

    controller = module.get<HistoryController>(HistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
