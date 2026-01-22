import { ApiProperty } from '@nestjs/swagger';
import { ShareLink } from '@prisma/client';

export class ShareResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shareId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  assetId: string;

  @ApiProperty()
  hasPassword: boolean;

  @ApiProperty({ nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ nullable: true })
  maxViews: number | null;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  shareUrl?: string; // Optional full URL helper

  @ApiProperty({ required: false })
  asset?: {
    id: string;
    name: string;
    type: string;
    thumbnailUrl: string | null;
    createdAt: Date;
  };

  constructor(partial: Partial<ShareResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(
    entity: ShareLink & { asset?: any },
    urlPrefix?: string,
  ): ShareResponseDto {
    return new ShareResponseDto({
      id: entity.id,
      shareId: entity.shareId,
      userId: entity.userId,
      assetId: entity.assetId,
      hasPassword: !!entity.password,
      expiresAt: entity.expiresAt,
      maxViews: entity.maxViews,
      viewCount: entity.viewCount,
      createdAt: entity.createdAt,
      shareUrl: urlPrefix ? `${urlPrefix}/shared/${entity.shareId}` : undefined,
      asset: entity.asset
        ? {
            id: entity.asset.id,
            name: entity.asset.name,
            type: entity.asset.type,
            thumbnailUrl: entity.asset.thumbnailUrl,
            createdAt: entity.asset.createdAt,
          }
        : undefined,
    });
  }
}
