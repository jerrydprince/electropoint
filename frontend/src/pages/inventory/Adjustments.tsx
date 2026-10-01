import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useAdjustStock } from '../../hooks/useInventory';
import { Save, AlertCircle } from 'lucide-react';

export default function Adjustments() {
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const adjustStock = useAdjustStock();

  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    type: 'opening_stock',
    quantity: '',
    reference: '',
    reason: '',
    serials: ''
  });

  const selectedProduct = products?.data?.find((p: any) => p.id.toString() === formData.product_id);
  const requiresSerials = selectedProduct?.serial_tracking;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty === 0) {
      alert("Quantity must be a non-zero number.");
      return;
    }

    const payload = {
      ...formData,
      quantity: qty,
      serials: requiresSerials ? formData.serials.split('\n').map(s => s.trim()).filter(s => s) : []
    };

    adjustStock.mutate(payload, {
      onSuccess: () => {
        alert("Stock adjusted successfully!");
        setFormData({
          ...formData,
          quantity: '',
          reference: '',
          reason: '',
          serials: ''
        });
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Error adjusting stock");
      }
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Adjustment</h1>
        <p className="text-gray-500 mt-1">Manually adjust inventory levels (Opening stock, damage, returns)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20">
                <option value="opening_stock">Opening Stock (+)</option>
                <option value="purchase">Purchase (+)</option>
                <option value="sale">Sale (-)</option>
                <option value="return">Customer Return (+)</option>
                <option value="purchase_return">Return to Supplier (-)</option>
                <option value="damage">Damage/Loss (-)</option>
                <option value="adjustment">Manual Adjustment (Any)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Delta *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="e.g. 5 or -2" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-gray-500 mt-1">Use negative values to deduct stock.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
              <input type="text" name="reference" value={formData.reference} onChange={handleChange} placeholder="e.g. PO-1029" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleChange} placeholder="e.g. Found in audit" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {requiresSerials && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <div className="flex items-start mb-2">
                <AlertCircle className="text-yellow-600 mt-0.5 mr-2" size={16} />
                <label className="block text-sm font-medium text-yellow-800">Serial Numbers Required</label>
              </div>
              <p className="text-xs text-yellow-700 mb-3">This product requires serial tracking. Enter exactly <b>{Math.abs(parseInt(formData.quantity) || 0)}</b> serial number(s), one per line.</p>
              <textarea 
                name="serials" 
                value={formData.serials} 
                onChange={handleChange} 
                rows={5} 
                required 
                placeholder="SN-001&#10;SN-002&#10;SN-003"
                className="w-full px-4 py-2 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400 bg-white"
              ></textarea>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={adjustStock.isPending} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm flex items-center disabled:opacity-50">
              <Save size={18} className="mr-2" />
              {adjustStock.isPending ? 'Processing...' : 'Process Adjustment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
