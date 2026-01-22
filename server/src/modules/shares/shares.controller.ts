import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { ShareResponseDto } from './dto/share-response.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';

@ApiTags('shares')
@Controller()
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  // --- Management Endpoints (Protected) ---

  @Post('shares')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new share link' })
  @ApiResponse({ type: ShareResponseDto })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() createShareDto: CreateShareDto,
  ) {
    const share = await this.sharesService.create(user.id, createShareDto);
    // Dynamically build URL prefix if possible, or leave it to frontend.
    // For now, returning entity, frontend constructs full URL.
    return ShareResponseDto.fromEntity(share);
  }

  @Get('shares')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user share links' })
  @ApiResponse({ type: [ShareResponseDto] })
  async findAll(@CurrentUser() user: RequestUser) {
    const shares = await this.sharesService.findAll(user.id);
    return shares.map((s) => ShareResponseDto.fromEntity(s));
  }

  @Get('shares/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific share link' })
  @ApiResponse({ type: ShareResponseDto })
  async findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const share = await this.sharesService.findOne(user.id, id);
    return ShareResponseDto.fromEntity(share);
  }

  @Patch('shares/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a share link' })
  @ApiResponse({ type: ShareResponseDto })
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() updateShareDto: UpdateShareDto,
  ) {
    const share = await this.sharesService.update(user.id, id, updateShareDto);
    return ShareResponseDto.fromEntity(share);
  }

  @Delete('shares/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a share link' })
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.sharesService.remove(user.id, id);
  }

  // --- Public Shared Endpoints ---

  @Get('shared/:shareId')
  @ApiOperation({ summary: 'Get public shared asset info' })
  async getPublicShare(@Param('shareId') shareId: string) {
    const share = await this.sharesService.getPublicShare(shareId);
    // Be careful NOT to expose full user object or internal DB IDs that shouldn't be public.
    // ShareResponseDto filters strictly.
    // Also, we might want to hide asset storagePath, so map to response DTO.
    return ShareResponseDto.fromEntity(share);
  }

  @Post('shared/:shareId/verify')
  @ApiOperation({ summary: 'Verify password for shared link' })
  async verifyPassword(
    @Param('shareId') shareId: string,
    @Body('password') password?: string,
  ) {
    const isValid = await this.sharesService.verifyPassword(shareId, password);
    return { valid: isValid };
  }

  @Post('shared/:shareId/download')
  @ApiOperation({ summary: 'Get download/view URL for shared asset' })
  async getDownloadUrl(
    @Param('shareId') shareId: string,
    @Body('password') password?: string,
    @Req() req?: any, // Type as any or Request (express)
  ) {
    // Extract hostname (e.g. "localhost" or "example.com") from request
    // req.hostname doesn't include port, but that's fine for our replacement logic which only sets hostname
    const hostname = req?.hostname || 'localhost';
    const url = await this.sharesService.generateSignedUrl(
      shareId,
      password,
      hostname,
    );
    return { url };
  }
}
