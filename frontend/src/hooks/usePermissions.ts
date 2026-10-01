import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string;
}

export const usePermissionsGrouped = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/permissions');
      return response.data.data as Record<string, Permission[]>;
    }
  });
};
