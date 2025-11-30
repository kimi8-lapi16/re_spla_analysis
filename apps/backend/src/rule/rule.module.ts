import { Module } from '@nestjs/common';
import { RuleRepository } from './rule.repository';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';

@Module({
  controllers: [RuleController],
  providers: [RuleRepository, RuleService],
  exports: [RuleRepository],
})
export class RuleModule {}
