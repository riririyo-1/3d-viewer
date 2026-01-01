import { ApiProperty } from '@nestjs/swagger';

export class AssetResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'model.obj' })
  name: string;

  @ApiProperty({ example: 'obj' })
  type: string;

  @ApiProperty({ example: 1024 })
  size: number;

  @ApiProperty({ example: 'http://localhost:9000/...' })
  storagePath: string;

  @ApiProperty({ example: 'http://localhost:9000/...' })
  thumbnailUrl: string | null;

  @ApiProperty()
  createdAt: Date;
}
