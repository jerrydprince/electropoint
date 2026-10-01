import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useInventoryDashboard = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['inventory-dashboard', warehouseId],
    queryFn: async () => {
      const response = await api.get('/inventory/dashboard', { params: { warehouse_id: warehouseId } });
      return response.data.data;
    }
  });
};

export const useInventory = (params?: any) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const response = await api.get('/inventory', { params });
      return response.data.data;
    }
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/inventory/adjust', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['product-serials'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    }
  });
};

export const useTransferStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/inventory/transfer', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['product-serials'] });
    }
  });
};

export const useInventoryTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['inventory-transactions', params],
    queryFn: async () => {
      const response = await api.get('/inventory-transactions', { params });
      return response.data.data;
    }
  });
};

export const useProductSerials = (params?: any) => {
  return useQuery({
    queryKey: ['product-serials', params],
    queryFn: async () => {
      const response = await api.get('/product-serials', { params });
      return response.data.data;
    }
  });
};

export const useStockTransferRequests = (params?: any) => {
  return useQuery({
    queryKey: ['stock-transfer-requests', params],
    queryFn: async () => {
      const response = await api.get('/stock-transfer-requests', { params });
      return response.data.data;
    }
  });
};

export const useCreateTransferRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/stock-transfer-requests', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-requests'] });
    }
  });
};

export const useApproveTransferRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/stock-transfer-requests/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['product-serials'] });
    }
  });
};

export const useRejectTransferRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/stock-transfer-requests/${id}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-requests'] });
    }
  });
};

