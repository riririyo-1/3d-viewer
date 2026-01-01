import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('history')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent history' })
  findAll(@CurrentUser() user: any) {
    return this.historyService.findAll(user.id);
  }

  @Post(':assetId')
  @ApiOperation({ summary: 'Add asset to history' })
  add(@CurrentUser() user: any, @Param('assetId') assetId: string) {
    return this.historyService.addRequest(user.id, assetId);
  }
}
