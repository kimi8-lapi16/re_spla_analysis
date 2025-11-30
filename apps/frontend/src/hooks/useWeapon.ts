import { useQuery } from '@tanstack/react-query';
import { WeaponsService } from '../api';

export function useWeapons() {
  const query = useQuery({
    queryKey: ['weapons'],
    queryFn: () => WeaponsService.weaponControllerGetWeapons(),
  });
  return {
    ...query,
    data: query.data?.weapons,
  };
}
