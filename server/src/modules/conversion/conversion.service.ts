import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ConversionService {
  constructor(
    @InjectQueue('conversion') private conversionQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async createJob(
    userId: string,
    assetId: string,
    storagePath: string,
    originalName: string,
  ) {
    // Create DB entry
    const job = await this.prisma.conversionJob.create({
      data: {
        userId,
        originalName,
        originalType: 'obj',
        convertedName: originalName.replace('.obj', '.glb'),
        convertedType: 'glb',
        status: 'pending',
      },
    });

    // Add to Queue
    await this.conversionQueue.add('convert', {
      conversionJobId: job.id,
      assetId,
      storagePath,
      outputFormat: 'glb',
    });

    return job;
  }
}
