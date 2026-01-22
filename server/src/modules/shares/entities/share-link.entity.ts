import { ApiProperty } from '@nestjs/swagger';
import { ShareLink as PrismaShareLink } from '@prisma/client';

export class ShareLinkEntity implements PrismaShareLink {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  assetId: string;

  @ApiProperty()
  shareId: string;

  @ApiProperty({ required: false, nullable: true })
  password: string | null;

  @ApiProperty({ required: false, nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ required: false, nullable: true })
  maxViews: number | null;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
