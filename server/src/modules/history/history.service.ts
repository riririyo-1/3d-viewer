import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.recentHistory.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: { lastOpenedAt: 'desc' },
      take: 20,
    });
  }

  async addRequest(userId: string, assetId: string) {
    // Upsert history
    return this.prisma.recentHistory.upsert({
      where: {
        idx_recent_history_user_asset: {
          userId,
          assetId,
        },
      },
      update: {
        lastOpenedAt: new Date(),
      },
      create: {
        userId,
        assetId,
        lastOpenedAt: new Date(),
      },
    });
  }
}
