import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';

@Module({
  controllers: [SharesController],
  providers: [SharesService],
})
export class SharesModule {}
