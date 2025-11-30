import { useQuery } from '@tanstack/react-query';
import { BattleTypesService } from '../api';

export function useBattleTypes() {
  const query = useQuery({
    queryKey: ['battleTypes'],
    queryFn: () => BattleTypesService.battleTypeControllerFindAll(),
  });
  return {
    ...query,
    data: query.data?.battleTypes,
  };
}
