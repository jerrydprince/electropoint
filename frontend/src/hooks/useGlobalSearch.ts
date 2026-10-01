import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];
      const response = await api.get('/search', { params: { q: query } });
      return response.data.data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 60000, // cache for 1 min
  });
};
