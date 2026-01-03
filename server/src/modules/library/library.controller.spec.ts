import { Test, TestingModule } from '@nestjs/testing';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

describe('LibraryController', () => {
  let controller: LibraryController;

  const mockLibraryService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryController],
      providers: [{ provide: LibraryService, useValue: mockLibraryService }],
    }).compile();

    controller = module.get<LibraryController>(LibraryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
