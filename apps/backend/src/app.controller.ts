import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthResponse } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ALB のターゲットグループのヘルスチェック先。
  // DB には触らない（DB 障害でタスクが入れ替わり続けるのを避けるため）。
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ summary: 'Liveness probe for the load balancer' })
  @ApiResponse({ status: 200, type: HealthResponse })
  getHealth(): HealthResponse {
    return { status: 'ok' };
  }
}
