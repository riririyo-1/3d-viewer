import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MinioService } from '../../infrastructure/storage/minio.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ConversionService } from '../conversion/conversion.service';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private configService: ConfigService,
    private conversionService: ConversionService,
  ) {}

  async create(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileExt = path.extname(file.originalname).substring(1).toLowerCase();
    const supportedTypes = ['obj', 'glb', 'gltf'];
    if (!supportedTypes.includes(fileExt)) {
      throw new BadRequestException(`Unsupported file type: ${fileExt}`);
    }

    const fileId = uuidv4();
    const objectName = `${userId}/${fileId}/${file.originalname}`;

    // Upload to MinIO
    await this.minioService.client.putObject(
      this.minioService.bucket,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    // Save to DB
    const asset = await this.prisma.asset.create({
      data: {
        userId,
        name: file.originalname,
        type: fileExt,
        size: BigInt(file.size),
        storagePath: objectName,
      },
    });

    if (fileExt === 'obj') {
      await this.conversionService.createJob(
        userId,
        asset.id,
        objectName,
        asset.name,
      );
    }

    return this.mapToResponse(asset);
  }

  async findAll(userId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return assets.map(this.mapToResponse);
  }

  async findOne(id: string, userId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Generate Pre-signed URL for download (valid for 1 hour)
    const downloadUrl = await this.minioService.client.presignedGetObject(
      this.minioService.bucket,
      asset.storagePath,
      3600,
    );

    return {
      ...this.mapToResponse(asset),
      downloadUrl,
    };
  }

  async remove(id: string, userId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Remove from MinIO
    await this.minioService.client.removeObject(
      this.minioService.bucket,
      asset.storagePath,
    );

    // Remove from DB
    await this.prisma.asset.delete({
      where: { id },
    });

    return { message: 'Asset deleted successfully' };
  }

  private mapToResponse(asset: any) {
    // Convert BigInt to number for JSON serialization
    return {
      ...asset,
      size: Number(asset.size),
    };
  }
}
