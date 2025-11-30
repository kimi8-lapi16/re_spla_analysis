import { Injectable } from '@nestjs/common';
import { StageRepository } from './stage.repository';
import { GetStagesResponse } from './stage.dto';

@Injectable()
export class StageService {
  constructor(private readonly stageRepository: StageRepository) {}

  async findAll(): Promise<GetStagesResponse> {
    const stages = await this.stageRepository.findAll();
    return { stages };
  }
}
