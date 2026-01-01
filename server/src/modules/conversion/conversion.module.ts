import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ConversionService } from './conversion.service';
import { ConversionController } from './conversion.controller';
import { ConversionProcessor } from './conversion.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'conversion',
    }),
    HttpModule,
  ],
  controllers: [ConversionController],
  providers: [ConversionService, ConversionProcessor],
  exports: [ConversionService],
})
export class ConversionModule {}
