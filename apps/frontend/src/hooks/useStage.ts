import { useQuery } from '@tanstack/react-query';
import { StagesService } from '../api';

export function useStages() {
  const query = useQuery({
    queryKey: ['stages'],
    queryFn: () => StagesService.stageControllerFindAll(),
  });
  return {
    ...query,
    data: query.data?.stages,
  };
}
