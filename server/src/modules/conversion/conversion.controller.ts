import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { AssetsService } from '../assets/assets.service';
import { ConversionService } from './conversion.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@ApiTags('conversion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversion')
export class ConversionController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly conversionService: ConversionService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('request')
  @ApiOperation({ summary: 'Upload file and start conversion' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        targetFormat: {
          type: 'string',
          enum: ['glb', 'gltf'],
          default: 'glb',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @CurrentUser() user: RequestUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body('targetFormat') targetFormat: string = 'glb',
  ) {
    if (targetFormat !== 'glb' && targetFormat !== 'gltf') {
      throw new BadRequestException(
        'Invalid target format. Must be glb or gltf',
      );
    }

    // 1. Upload Asset (Skip Auto Conversion)
    const asset = await this.assetsService.create(user.id, file, {
      skipAutoConversion: true,
    });

    // 2. Create Conversion Job
    const job = await this.conversionService.createJob(
      user.id,
      asset.id,
      asset.storagePath,
      asset.name,
      targetFormat,
    );

    return {
      conversionJobId: job.id,
      status: job.status,
      originalName: job.originalName,
    };
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get conversion status' })
  async getStatus(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const job = await this.prisma.conversionJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId !== user.id) {
      throw new NotFoundException('Job not found'); // Hide existence
    }

    const response: any = {
      conversionJobId: job.id,
      status: job.status,
      originalName: job.originalName,
      convertedName: job.convertedName,
    };

    if (job.status === 'completed' && job.convertedName && job.storagePath) {
      // Find the converted asset
      // In conversion.processor, we created a new asset for the converted file
      // We can find it by name or we could have stored assetId in Job (TODO: add assetId to Job model?)
      // For now, let's find the asset by convertedName and user
      const asset = await this.prisma.asset.findFirst({
        where: {
          userId: user.id,
          storagePath: job.storagePath, // The processor updates job.storagePath with the NEW path
        },
      });

      if (asset) {
        response.downloadUrl = `/assets/${asset.id}/file`;
      }
    }

    if (job.status === 'failed') {
      response.message = job.errorMessage;
    }

    return response;
  }
}
