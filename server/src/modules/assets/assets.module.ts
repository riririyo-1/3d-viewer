import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ConversionModule } from '../conversion/conversion.module';

@Module({
  imports: [StorageModule, AuthModule, ConversionModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
