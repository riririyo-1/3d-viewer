import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async updateLanguage(userId: string, language: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { language },
    });
  }
}
