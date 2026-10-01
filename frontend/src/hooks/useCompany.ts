import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useCompany = () => {
  return useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const response = await api.get('/company');
      return response.data.data;
    }
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      // Must use multipart/form-data for file upload
      const response = await api.post('/company', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
    }
  });
};
