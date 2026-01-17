import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
  StreamableFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AssetResponseDto } from './dto/asset-response.dto';
import { CreateAssetInputDto } from './dto/input/create-asset.input.dto';
import { CreateAssetOutputDto } from './dto/output/create-asset.output.dto';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a 3D asset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @CurrentUser() user: RequestUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<AssetResponseDto> {
    const input: CreateAssetInputDto = {
      userId: user.id,
      file,
    };
    const output = await this.assetsService.create(input);
    return this.mapToResponseDto(output);
  }

  private mapToResponseDto(output: CreateAssetOutputDto): AssetResponseDto {
    return {
      id: output.id,
      name: output.name,
      type: output.type,
      size: output.size,
      storagePath: output.storagePath,
      thumbnailUrl: output.thumbnailUrl,
      createdAt: output.createdAt,
      downloadUrl: `/assets/${output.id}/file`,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List user assets' })
  findAll(@CurrentUser() user: RequestUser) {
    return this.assetsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details with download URL' })
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.assetsService.findOne(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete asset' })
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.assetsService.remove(id, user.id);
  }
  @Get(':id/file')
  @ApiOperation({ summary: 'Download asset file' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename, mimetype } =
      await this.assetsService.getFileStream(id, user.id);

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(stream);
  }
}
