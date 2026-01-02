import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

interface ConversionJobData {
  conversionJobId: string;
  assetId: string;
  storagePath: string;
  outputFormat: string;
}

interface PipelineResponse {
  converted_path: string;
  format: string;
  size?: number;
}

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

  async process(job: Job<ConversionJobData>): Promise<void> {
    const { conversionJobId, storagePath, outputFormat } = job.data;
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
        this.httpService.post<PipelineResponse>(
          `${pipelineUrl}/conversion/obj2glb`,
          {
            storage_path: storagePath,
            output_format: outputFormat,
          },
        ),
      );

      const result = response.data;
      this.logger.log(`Conversion successful: ${JSON.stringify(result)}`);

      const convertedFileName = result.converted_path.split('/').pop();
      if (!convertedFileName) {
        throw new Error('Invalid converted path');
      }

      // Update DB with result
      await this.prisma.conversionJob.update({
        where: { id: conversionJobId },
        data: {
          status: 'completed',
          convertedName: convertedFileName,
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
            name: convertedFileName,
            type: result.format,
            size: BigInt(result.size ?? 0),
            storagePath: result.converted_path,
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Conversion failed: ${errorMessage}`, errorStack);

      await this.prisma.conversionJob.update({
        where: { id: conversionJobId },
        data: {
          status: 'failed',
          errorMessage,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
