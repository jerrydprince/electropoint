import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// --- Purchase Requisitions ---

export const usePurchaseRequisitions = (params?: any) => {
  return useQuery({
    queryKey: ['purchase-requisitions', params],
    queryFn: async () => {
      const response = await api.get('/purchase-requisitions', { params });
      return response.data.data;
    }
  });
};

export const usePurchaseRequisition = (id: string) => {
  return useQuery({
    queryKey: ['purchase-requisition', id],
    queryFn: async () => {
      const response = await api.get(`/purchase-requisitions/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

export const useCreatePurchaseRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/purchase-requisitions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requisitions'] });
    }
  });
};

export const useUpdatePurchaseRequisitionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await api.post(`/purchase-requisitions/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requisition', id] });
    }
  });
};

// --- Purchase Orders ---

export const usePurchaseOrders = (params?: any) => {
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: async () => {
      const response = await api.get('/purchase-orders', { params });
      return response.data.data;
    }
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      const response = await api.get(`/purchase-orders/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/purchase-orders', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await api.post(`/purchase-orders/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    }
  });
};

export const useReceiveGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, items }: { id: string, items: any[] }) => {
      const response = await api.post(`/purchase-orders/${id}/receive`, { items });
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['product-serials'] });
    }
  });
};
