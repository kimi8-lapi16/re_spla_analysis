import { Injectable } from '@nestjs/common';
import { BattleTypeRepository } from './battle-type.repository';
import { GetBattleTypesResponse } from './battle-type.dto';

@Injectable()
export class BattleTypeService {
  constructor(private readonly battleTypeRepository: BattleTypeRepository) {}

  async findAll(): Promise<GetBattleTypesResponse> {
    const battleTypes = await this.battleTypeRepository.findAll();
    return { battleTypes };
  }
}
