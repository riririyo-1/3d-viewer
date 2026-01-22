import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateShareDto {
  @ApiProperty({ description: 'Asset ID to share' })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @ApiPropertyOptional({ description: 'Password for protection', minLength: 4 })
  @IsString()
  @IsOptional()
  @MinLength(4)
  password?: string;

  @ApiPropertyOptional({ description: 'Expiration date (ISO 8601)' })
  @IsISO8601()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Maximum view count', minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxViews?: number;
}
