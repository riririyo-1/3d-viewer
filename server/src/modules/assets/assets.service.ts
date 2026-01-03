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
import { AssetResponseDto } from './dto/asset-response.dto';
import { Readable } from 'stream';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private configService: ConfigService,
    private conversionService: ConversionService,
  ) {}

  async create(
    userId: string,
    file: Express.Multer.File,
  ): Promise<AssetResponseDto> {
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

  async findAll(userId: string): Promise<AssetResponseDto[]> {
    const assets = await this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Return relative URL so frontend can prepend its dynamic API base
    return assets.map((asset) => ({
      ...this.mapToResponse(asset),
      downloadUrl: `/assets/${asset.id}/file`,
    }));
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<AssetResponseDto & { downloadUrl: string }> {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Return relative URL
    return {
      ...this.mapToResponse(asset),
      downloadUrl: `/assets/${asset.id}/file`,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
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

  // -- BigIntをnumberに変換してJSON直列化可能にする --------------
  private mapToResponse(asset: {
    id: string;
    userId: string;
    name: string;
    type: string;
    size: bigint;
    storagePath: string;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AssetResponseDto {
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      size: Number(asset.size),
      storagePath: asset.storagePath,
      thumbnailUrl: asset.thumbnailUrl,
      createdAt: asset.createdAt,
      downloadUrl: '', // Default or handled by caller.
    };
  }
  async getFileStream(
    id: string,
    userId: string,
  ): Promise<{
    stream: Readable;
    filename: string;
    mimetype: string;
  }> {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    const stream = await this.minioService.getFileStream(asset.storagePath);
    return {
      stream,
      filename: asset.name,
      mimetype: this.getMimeType(asset.type),
    };
  }

  private getMimeType(type: string): string {
    switch (type.toLowerCase()) {
      case 'obj':
        return 'text/plain';
      case 'glb':
        return 'model/gltf-binary';
      case 'gltf':
        return 'model/gltf+json';
      default:
        return 'application/octet-stream';
    }
  }
}
