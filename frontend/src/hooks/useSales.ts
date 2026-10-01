import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useSalesHistory = (params?: any) => {
  return useQuery({
    queryKey: ['sales-history', params],
    queryFn: async () => {
      const response = await api.get('/sales-history', { params });
      return response.data.data;
    }
  });
};

export const useSale = (id?: string) => {
  return useQuery({
    queryKey: ['sales-history', id],
    queryFn: async () => {
      const response = await api.get(`/sales-history/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};
