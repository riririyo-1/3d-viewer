import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

@Processor('conversion')
export class ConversionProcessor extends WorkerHost {
  private readonly logger = new Logger(ConversionProcessor.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, conversionJobId, storagePath, outputFormat } = job.data;
    this.logger.log(
      `Processing job ${job.id} for conversion ${conversionJobId}`,
    );

    try {
      // Update status to processing
      await this.prisma.conversionJob.update({
        where: { id: conversionJobId },
        data: { status: 'processing' },
      });

      const pipelineUrl = this.configService.get<string>(
        'PIPELINE_API_URL',
        'http://pipeline:8000',
      );

      this.logger.debug(
        `Calling pipeline at ${pipelineUrl}/conversion/obj2glb`,
      );

      // Call Pipeline
      const response = await firstValueFrom(
        this.httpService.post(`${pipelineUrl}/conversion/obj2glb`, {
          storage_path: storagePath,
          output_format: outputFormat,
        }),
      );

      const result = response.data;
      this.logger.log(`Conversion successful: ${JSON.stringify(result)}`);

      // Update DB with result
      await this.prisma.conversionJob.update({
        where: { id: conversionJobId },
        data: {
          status: 'completed',
          convertedName: result.converted_path.split('/').pop(),
          convertedType: result.format,
          storagePath: result.converted_path,
          completedAt: new Date(),
        },
      });

      // Also create a new Asset entry for the converted file
      const originalJob = await this.prisma.conversionJob.findUnique({
        where: { id: conversionJobId },
      });

      if (originalJob) {
        // Verify if asset already exists to avoid duplicates if re-run?
        // For now, create new asset
        await this.prisma.asset.create({
          data: {
            userId: originalJob.userId,
            name: result.converted_path.split('/').pop(),
            type: result.format,
            size: BigInt(0), // We don't know the size yet unless pipeline returns it. Pipeline response update needed?
            storagePath: result.converted_path,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Conversion failed: ${error.message}`, error.stack);

      await this.prisma.conversionJob.update({
        where: { id: conversionJobId },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
