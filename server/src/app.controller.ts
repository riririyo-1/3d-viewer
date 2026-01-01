import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller()
@ApiTags('Root')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API情報取得' })
  getInfo() {
    return {
      name: 'Studio View API',
      version: '1.0.0',
      description: '3Dアセット管理・変換APIサーバー',
      endpoints: {
        swagger: '/api',
        health: '/health',
        auth: '/auth',
        assets: '/assets',
        conversion: '/conversion',
        history: '/history',
        settings: '/settings',
        library: '/library',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'ヘルスチェック' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
