import { Express } from 'express';

export class CreateAssetInputDto {
  userId: string;
  file: Express.Multer.File;
  options?: {
    skipAutoConversion?: boolean;
  };
}
