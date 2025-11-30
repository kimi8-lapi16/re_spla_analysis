import { Module } from '@nestjs/common';
import { StageRepository } from './stage.repository';

@Module({
  providers: [StageRepository],
  exports: [StageRepository],
})
export class StageModule {}
