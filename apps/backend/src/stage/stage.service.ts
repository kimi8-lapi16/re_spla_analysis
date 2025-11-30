import { Injectable } from '@nestjs/common';
import { StageRepository } from './stage.repository';
import { GetStagesResponse, StageResponse } from './stage.dto';

@Injectable()
export class StageService {
  constructor(private readonly stageRepository: StageRepository) {}

  async findAll(): Promise<GetStagesResponse> {
    const stages = await this.stageRepository.findAll();
    const stageResponses: StageResponse[] = stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
    }));
    return { stages: stageResponses };
  }
}
