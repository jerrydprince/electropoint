import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useGoodsReceipts = (params?: any) => {
  return useQuery({
    queryKey: ['goods-receipts', params],
    queryFn: async () => {
      const response = await api.get('/goods-receipts', { params });
      return response.data.data;
    }
  });
};

export const useGoodsReceipt = (id?: string) => {
  return useQuery({
    queryKey: ['goods-receipts', id],
    queryFn: async () => {
      const response = await api.get(`/goods-receipts/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

export const useCreateGoodsReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/goods-receipts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
};
