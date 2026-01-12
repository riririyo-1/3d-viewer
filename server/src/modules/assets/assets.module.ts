import { Module, forwardRef } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ConversionModule } from '../conversion/conversion.module';

@Module({
  imports: [StorageModule, AuthModule, forwardRef(() => ConversionModule)],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
