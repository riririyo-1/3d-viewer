import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MinioService } from '../../infrastructure/storage/minio.service';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharesService {
  private s3Client: S3Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {
    const minioHost = this.configService.get<string>(
      'MINIO_ENDPOINT',
      'localhost',
    );
    const minioPort = this.configService.get<string>('MINIO_PORT', '9000');

    // S3Client expects a full URL
    const endpoint = minioHost.startsWith('http')
      ? minioHost
      : `http://${minioHost}:${minioPort}`;

    this.s3Client = new S3Client({
      endpoint,
      region: 'us-east-1', // MinIO default
      credentials: {
        accessKeyId: this.configService.get<string>(
          'MINIO_ACCESS_KEY',
          'minioadmin',
        ),
        secretAccessKey: this.configService.get<string>(
          'MINIO_SECRET_KEY',
          'minioadmin',
        ),
      },
      forcePathStyle: true,
    });
  }

  async create(userId: string, createShareDto: CreateShareDto) {
    // Check if asset belongs to user
    const asset = await this.prisma.asset.findUnique({
      where: { id: createShareDto.assetId },
    });

    if (!asset || asset.userId !== userId) {
      throw new BadRequestException('Invalid asset');
    }

    const shareId = nanoid(12);
    const passwordHash = createShareDto.password
      ? await bcrypt.hash(createShareDto.password, 10)
      : null;

    return this.prisma.shareLink.create({
      data: {
        userId,
        assetId: createShareDto.assetId,
        shareId,
        password: passwordHash,
        expiresAt: createShareDto.expiresAt
          ? new Date(createShareDto.expiresAt)
          : null,
        maxViews: createShareDto.maxViews,
      },
      include: {
        asset: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.shareLink.findMany({
      where: { userId },
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const share = await this.prisma.shareLink.findUnique({
      where: { id },
      include: {
        asset: true,
      },
    });

    if (!share || share.userId !== userId) {
      throw new NotFoundException('Share link not found');
    }

    return share;
  }

  async update(userId: string, id: string, updateShareDto: UpdateShareDto) {
    await this.findOne(userId, id); // Ensure ownership

    const data: any = { ...updateShareDto };
    if (updateShareDto.password) {
      data.password = await bcrypt.hash(updateShareDto.password, 10);
    }
    if (updateShareDto.expiresAt) {
      data.expiresAt = new Date(updateShareDto.expiresAt);
    }

    return this.prisma.shareLink.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Ensure ownership
    return this.prisma.shareLink.delete({
      where: { id },
    });
  }

  async getPublicShare(shareId: string) {
    const share = await this.prisma.shareLink.findUnique({
      where: { shareId },
      include: {
        asset: true,
        user: {
          select: {
            // Only expose safe user info if needed, or nothing
            id: true,
            // name: true, // User model might not have name, check schema
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new ForbiddenException('Share link expired');
    }

    if (share.maxViews && share.viewCount >= share.maxViews) {
      throw new ForbiddenException('Share link limit reached');
    }

    return share;
  }

  async verifyPassword(shareId: string, password?: string) {
    const share = await this.prisma.shareLink.findUnique({
      where: { shareId },
    });

    if (!share) {
      throw new NotFoundException('Share link not found');
    }

    if (!share.password) {
      return true;
    }

    if (!password) {
      return false;
    }

    return bcrypt.compare(password, share.password);
  }

  async generateSignedUrl(
    shareId: string,
    password?: string,
    publicHost?: string,
  ) {
    const share = await this.getPublicShare(shareId);

    // Verify password if set
    if (share.password) {
      if (!password) {
        throw new ForbiddenException('Password required');
      }
      const valid = await bcrypt.compare(password, share.password);
      if (!valid) {
        throw new ForbiddenException('Invalid password');
      }
    }

    // Increment view count
    await this.prisma.shareLink.update({
      where: { id: share.id },
      data: { viewCount: { increment: 1 } },
    });

    const command = new GetObjectCommand({
      Bucket: this.minioService.bucket,
      Key: share.asset.storagePath,
    });

    let client = this.s3Client;

    if (publicHost) {
      const minioPort = this.configService.get<string>('MINIO_PORT', '9000');
      const publicEndpoint = `http://${publicHost}:${minioPort}`;

      // Create a temporary client with the public endpoint
      client = new S3Client({
        endpoint: publicEndpoint,
        region: 'us-east-1',
        credentials: {
          accessKeyId: this.configService.get<string>(
            'MINIO_ACCESS_KEY',
            'minioadmin',
          ),
          secretAccessKey: this.configService.get<string>(
            'MINIO_SECRET_KEY',
            'minioadmin',
          ),
        },
        forcePathStyle: true,
      });
    }

    // 15 minutes expiration
    return getSignedUrl(client, command, { expiresIn: 900 });
  }
}
