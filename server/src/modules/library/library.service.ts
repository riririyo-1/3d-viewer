import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.libraryModel.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
