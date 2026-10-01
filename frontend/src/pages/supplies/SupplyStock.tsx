import React, { useState } from 'react';
import { useSupplyStock, useReceiveSupplies, useSupplies } from '../../hooks/useSupplies';
import { useBranches } from '../../hooks/useBranches';
import { Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplyStock() {
  const { data: stockData, isLoading: loadingStock } = useSupplyStock();
  const { data: supplies } = useSupplies();
  const { data: branches } = useBranches();
  const receiveSupplies = useReceiveSupplies();

  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [receiveData, setReceiveData] = useState({
    branch_id: '',
    reference: '',
    notes: '',
    items: [{ supply_id: '', quantity: '' }]
  });

  const stock = Array.isArray(stockData) ? stockData : stockData?.data || [];
  
  // Aggregate stock for dashboard
  const lowStockAlerts = stock.filter((s: any) => s.quantity <= (s.supply?.reorder_level || 0));

  const handleAddItem = () => {
    setReceiveData({
      ...receiveData,
      items: [...receiveData.items, { supply_id: '', quantity: '' }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...receiveData.items];
    newItems.splice(index, 1);
    setReceiveData({ ...receiveData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...receiveData.items] as any;
    newItems[index][field] = value;
    setReceiveData({ ...receiveData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!receiveData.branch_id) return toast.error("Please select a branch");
    if (receiveData.items.some(i => !i.supply_id || !i.quantity)) return toast.error("Please fill all item fields");

    receiveSupplies.mutate(receiveData, {
      onSuccess: () => {
        toast.success("Supplies received successfully");
        setShowReceiveForm(false);
        setReceiveData({ branch_id: '', reference: '', notes: '', items: [{ supply_id: '', quantity: '' }] });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error receiving supplies')
    });
  };

  if (loadingStock) return <div className="text-center py-8">Loading stock...</div>;

  return (
    <div className="space-y-8">
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
          <AlertTriangle className="text-red-500 mr-3 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-800">Low Stock Alerts</h4>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {lowStockAlerts.map((s: any) => (
                <li key={s.id}>{s.supply?.name} in {s.branch?.name} (Current: {s.quantity} {s.supply?.unit}, Reorder Level: {s.supply?.reorder_level})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Current Stock Levels</h2>
          <button onClick={() => setShowReceiveForm(!showReceiveForm)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-700 flex inline-flex items-center">
            <Plus size={16} className="mr-1" /> Receive Supplies
          </button>
        </div>

        {showReceiveForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Receive Supplies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Branch</label>
                <select required value={receiveData.branch_id} onChange={e => setReceiveData({...receiveData, branch_id: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">Select Branch</option>
                  {branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                <input type="text" value={receiveData.reference} onChange={e => setReceiveData({...receiveData, reference: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g. Purchase Receipt #123" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Items Received</label>
              {receiveData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select required value={item.supply_id} onChange={e => handleItemChange(index, 'supply_id', e.target.value)} className="flex-1 p-2 border rounded-lg">
                    <option value="">Select Supply</option>
                    {supplies?.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                  </select>
                  <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-32 p-2 border rounded-lg" />
                  {receiveData.items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="text-sm font-medium text-primary hover:text-red-700">+ Add Another Item</button>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowReceiveForm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={receiveSupplies.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save Receipt</button>
            </div>
          </form>
        )}

        <table className="w-full text-left border rounded-xl overflow-hidden">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Branch</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Item Name</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Qty Available</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stock.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No stock recorded yet.</td></tr>
            ) : (
              stock.map((s: any) => {
                const isLow = s.quantity <= (s.supply?.reorder_level || 0);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{s.branch?.name}</td>
                    <td className="p-4 text-gray-600 text-sm">{s.supply?.category?.name}</td>
                    <td className="p-4 font-medium text-gray-900">{s.supply?.name}</td>
                    <td className="p-4 font-bold text-gray-900 text-right">{s.quantity} <span className="text-gray-400 text-xs uppercase">{s.supply?.unit}</span></td>
                    <td className="p-4 text-right">
                      {isLow ? <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold uppercase">Low Stock</span> : <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold uppercase">In Stock</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
