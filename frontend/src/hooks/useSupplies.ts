import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Categories
export const useSupplyCategories = () => {
  return useQuery({
    queryKey: ['supply-categories'],
    queryFn: async () => {
      const response = await api.get('/supply-categories');
      return response.data.data;
    }
  });
};

export const useCreateSupplyCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/supply-categories', data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supply-categories'] })
  });
};

// Supplies
export const useSupplies = () => {
  return useQuery({
    queryKey: ['supplies'],
    queryFn: async () => {
      const response = await api.get('/supplies');
      return response.data.data;
    }
  });
};

export const useCreateSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/supplies', data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplies'] })
  });
};

// Stock
export const useSupplyStock = (params?: any) => {
  return useQuery({
    queryKey: ['supply-stock', params],
    queryFn: async () => {
      const response = await api.get('/supply-stock', { params });
      return response.data.data;
    }
  });
};

export const useReceiveSupplies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/supply-stock/receive', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supply-stock'] });
      queryClient.invalidateQueries({ queryKey: ['supply-transactions'] });
    }
  });
};

export const useSupplyTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['supply-transactions', params],
    queryFn: async () => {
      const response = await api.get('/supply-stock/transactions', { params });
      return response.data.data;
    }
  });
};

// Requests
export const useSupplyRequests = (params?: any) => {
  return useQuery({
    queryKey: ['supply-requests', params],
    queryFn: async () => {
      const response = await api.get('/supply-requests', { params });
      return response.data.data;
    }
  });
};

export const useCreateSupplyRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/supply-requests', data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supply-requests'] })
  });
};

export const useProcessSupplyRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await api.post(`/supply-requests/${id}/process`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supply-requests'] });
      queryClient.invalidateQueries({ queryKey: ['supply-stock'] });
      queryClient.invalidateQueries({ queryKey: ['supply-transactions'] });
    }
  });
};
