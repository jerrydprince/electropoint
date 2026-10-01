import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useSupplierInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['supplier-invoices', params],
    queryFn: async () => {
      const response = await api.get('/supplier-invoices', { params });
      return response.data.data;
    }
  });
};

export const useCreateSupplierInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/supplier-invoices', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-statement', variables.supplier_id] });
    }
  });
};

export const useSupplierPayments = (params?: any) => {
  return useQuery({
    queryKey: ['supplier-payments', params],
    queryFn: async () => {
      const response = await api.get('/supplier-payments', { params });
      return response.data.data;
    }
  });
};

export const useCreateSupplierPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/supplier-payments', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-statement', variables.supplier_id] });
    }
  });
};

export const useSupplierStatement = (supplierId?: string) => {
  return useQuery({
    queryKey: ['supplier-statement', supplierId],
    queryFn: async () => {
      const response = await api.get(`/suppliers/${supplierId}/statement`);
      return response.data.data;
    },
    enabled: !!supplierId
  });
};
