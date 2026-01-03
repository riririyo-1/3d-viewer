import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getInfo', () => {
    it('should return API information', () => {
      const result = appController.getInfo();
      expect(result).toHaveProperty('name', 'Studio View API');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('endpoints');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
