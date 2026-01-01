import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put('language')
  @ApiOperation({ summary: 'Update user language' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { language: { type: 'string', example: 'en' } },
    },
  })
  updateLanguage(@CurrentUser() user: any, @Body('language') language: string) {
    return this.settingsService.updateLanguage(user.id, language);
  }
}
