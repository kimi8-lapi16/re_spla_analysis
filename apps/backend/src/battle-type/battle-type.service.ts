import { Injectable } from '@nestjs/common';
import { BattleTypeRepository } from './battle-type.repository';
import { GetBattleTypesResponse, BattleTypeResponse } from './battle-type.dto';

@Injectable()
export class BattleTypeService {
  constructor(private readonly battleTypeRepository: BattleTypeRepository) {}

  async findAll(): Promise<GetBattleTypesResponse> {
    const battleTypes = await this.battleTypeRepository.findAll();
    const battleTypeResponses: BattleTypeResponse[] = battleTypes.map(
      (battleType) => ({
        id: battleType.id,
        name: battleType.name,
      }),
    );
    return { battleTypes: battleTypeResponses };
  }
}
