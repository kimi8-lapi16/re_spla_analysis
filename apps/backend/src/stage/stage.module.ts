import { Module } from '@nestjs/common';
import { StageRepository } from './stage.repository';
import { StageService } from './stage.service';
import { StageController } from './stage.controller';

@Module({
  controllers: [StageController],
  providers: [StageRepository, StageService],
  exports: [StageRepository],
})
export class StageModule {}
