import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisUseCase } from './analysis.usecase';

@Module({
  imports: [CommonModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisUseCase],
})
export class AnalysisModule {}
