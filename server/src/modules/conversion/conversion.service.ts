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
    outputFormat: 'glb' | 'gltf' = 'glb',
  ) {
    const convertedExtension = outputFormat === 'glb' ? '.glb' : '.gltf';
    const convertedName = originalName.replace(/\.obj$/i, convertedExtension);

    // Create DB entry
    const job = await this.prisma.conversionJob.create({
      data: {
        userId,
        originalName,
        originalType: 'obj',
        convertedName: convertedName,
        convertedType: outputFormat,
        status: 'pending',
      },
    });

    // Add to Queue
    await this.conversionQueue.add('convert', {
      conversionJobId: job.id,
      assetId,
      storagePath,
      outputFormat: outputFormat,
    });

    return job;
  }
}
