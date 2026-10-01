import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const usePosProducts = (params?: { q?: string, category_id?: string }) => {
  return useQuery({
    queryKey: ['pos-products', params],
    queryFn: async () => {
      const response = await api.get('/pos/products', { params });
      return response.data.data;
    }
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/pos/checkout', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate inventory and sales queries after a successful checkout
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};
