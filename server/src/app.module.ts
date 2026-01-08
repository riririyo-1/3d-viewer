import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ConversionModule } from './modules/conversion/conversion.module';
import { HistoryModule } from './modules/history/history.module';
import { SettingsModule } from './modules/settings/settings.module';
import { LibraryModule } from './modules/library/library.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    StorageModule,
    CacheModule,
    QueueModule,
    AuthModule,
    AssetsModule,
    ConversionModule,
    HistoryModule,
    SettingsModule,
    LibraryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
