import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { X, TrendingUp, TrendingDown, Clock, Package } from 'lucide-react';

interface StockCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  warehouseId?: string;
}

export default function StockCardModal({ isOpen, onClose, productId, warehouseId }: StockCardModalProps) {
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await api.get(`/products/${productId}`);
      return response.data.data;
    },
    enabled: !!productId && isOpen
  });

  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-transactions', { product_id: productId, warehouse_id: warehouseId }],
    queryFn: async () => {
      if (!productId) return null;
      const params: any = { product_id: productId };
      if (warehouseId) params.warehouse_id = warehouseId;
      const response = await api.get('/inventory-transactions', { params });
      return response.data.data;
    },
    enabled: !!productId && isOpen
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b shrink-0 bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Package size={20} className="mr-2 text-primary" />
              Stock Card
            </h2>
            {product && (
              <p className="text-sm text-gray-500 mt-1">
                {product.name} (SKU: {product.sku})
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading stock history...</div>
          ) : !movements?.data || movements.data.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transaction history found for this product.</div>
          ) : (
            <div className="space-y-4">
              {movements.data.map((movement: any) => (
                <div key={movement.id} className="flex items-start bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className={`p-3 rounded-full mr-4 ${movement.quantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {movement.quantity > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 uppercase text-sm">{movement.type?.replace(/_/g, ' ') || movement.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{movement.notes || 'No description provided.'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          Balance: {movement.balance_after}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(movement.created_at).toLocaleString()}</span>
                      <span>Ref: {movement.reference || 'N/A'}</span>
                      <span>By: {movement.user?.name || 'System'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
