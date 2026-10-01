import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useAdjustStock } from '../../hooks/useInventory';
import { AlertCircle, X } from 'lucide-react';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
  defaultWarehouseId?: string;
}

export default function AdjustmentModal({ isOpen, onClose, defaultProductId, defaultWarehouseId }: AdjustmentModalProps) {
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const adjustStock = useAdjustStock();

  const [formData, setFormData] = useState({
    product_id: defaultProductId || '',
    warehouse_id: defaultWarehouseId || '',
    quantity: '',
    type: 'add',
    reason: '',
    serials: ''
  });

  if (!isOpen) return null;

  const selectedProduct = products?.data?.find((p: any) => p.id.toString() === formData.product_id);
  const requiresSerials = selectedProduct?.serial_tracking;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity),
      serials: requiresSerials ? formData.serials.split('\n').map(s => s.trim()).filter(s => s) : []
    };

    adjustStock.mutate(payload, {
      onSuccess: () => {
        alert("Stock adjusted successfully!");
        onClose();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Error adjusting stock");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select name="product_id" value={formData.product_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20">
                <option value="">-- Select Product --</option>
                {products?.data?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
              <select name="warehouse_id" value={formData.warehouse_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20">
                <option value="">-- Select Warehouse --</option>
                {warehouses?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'add'})}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${formData.type === 'add' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Add (In)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'subtract'})}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${formData.type === 'subtract' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Subtract (Out)
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <select name="reason" value={formData.reason} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20">
              <option value="">-- Select Reason --</option>
              {formData.type === 'add' ? (
                <>
                  <option value="opening_stock">Opening Stock</option>
                  <option value="purchase">Purchase</option>
                  <option value="return">Customer Return</option>
                  <option value="correction">Inventory Correction (Found)</option>
                </>
              ) : (
                <>
                  <option value="damage">Damage / Scrap</option>
                  <option value="correction">Inventory Correction (Lost)</option>
                  <option value="expired">Expired / Obsolete</option>
                </>
              )}
            </select>
          </div>

          {requiresSerials && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <div className="flex items-start mb-2">
                <AlertCircle className="text-yellow-600 mt-0.5 mr-2" size={16} />
                <label className="block text-sm font-medium text-yellow-800">Serial Numbers Required</label>
              </div>
              <p className="text-xs text-yellow-700 mb-3">This product requires serial tracking. Enter exactly <b>{parseInt(formData.quantity) || 0}</b> serial number(s), one per line.</p>
              <textarea 
                name="serials" 
                value={formData.serials} 
                onChange={handleChange} 
                rows={4} 
                required 
                className="w-full px-4 py-2 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400 bg-white font-mono"
              ></textarea>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={adjustStock.isPending} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-sm disabled:opacity-50">
              {adjustStock.isPending ? 'Processing...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
