import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useCorporatePlans = (params?: any) => {
  return useQuery({
    queryKey: ['corporate-plans', params],
    queryFn: async () => {
      const response = await api.get('/corporate-plans', { params });
      return response.data.data;
    }
  });
};

export const useCorporatePlan = (id?: string) => {
  return useQuery({
    queryKey: ['corporate-plans', id],
    queryFn: async () => {
      const response = await api.get(`/corporate-plans/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

export const useCreateCorporatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/corporate-plans', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-plans'] });
    }
  });
};

export const useUpdateCorporatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await api.put(`/corporate-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-plans'] });
      queryClient.invalidateQueries({ queryKey: ['corporate-plans', variables.id] });
    }
  });
};

export const useDeleteCorporatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/corporate-plans/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-plans'] });
    }
  });
};
