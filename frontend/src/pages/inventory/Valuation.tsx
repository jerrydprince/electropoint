import React, { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Download, Search, DollarSign } from 'lucide-react';

export default function Valuation() {
  const [warehouseId, setWarehouseId] = useState('');
  const [search, setSearch] = useState('');

  const { data: inventoryData, isLoading } = useInventory(warehouseId ? { warehouse_id: warehouseId } : {});
  const { data: warehouses } = useWarehouses();

  const handleExportCSV = () => {
    if (!inventoryData?.data) return;
    const headers = ['Warehouse', 'Product SKU', 'Product Name', 'Available Qty', 'Cost Price (N)', 'Selling Price (N)', 'Total Cost Value (N)', 'Total Retail Value (N)'];
    const rows = inventoryData.data.map((inv: any) => [
      inv.warehouse?.name,
      inv.product?.sku,
      inv.product?.name,
      inv.quantity,
      inv.product?.cost_price || 0,
      inv.product?.selling_price || 0,
      (inv.quantity * parseFloat(inv.product?.cost_price || '0')).toFixed(2),
      (inv.quantity * parseFloat(inv.product?.selling_price || '0')).toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredInventory = inventoryData?.data?.filter((inv: any) => 
    inv.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.product?.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalCost = filteredInventory.reduce((sum: number, inv: any) => sum + (inv.quantity * parseFloat(inv.product?.cost_price || '0')), 0);
  const totalRetail = filteredInventory.reduce((sum: number, inv: any) => sum + (inv.quantity * parseFloat(inv.product?.selling_price || '0')), 0);

  return (
    <div className="p-6 w-full mx-auto animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Valuation</h1>
          <p className="text-gray-500 mt-1">Financial value of your current stock</p>
        </div>
        <button onClick={handleExportCSV} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center shadow-sm">
          <Download size={18} className="mr-2" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-red-100 text-red-600 rounded-full mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Cost Value</p>
            <h3 className="text-2xl font-bold text-gray-900">₦{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-green-100 text-green-600 rounded-full mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Retail Value</p>
            <h3 className="text-2xl font-bold text-gray-900">₦{totalRetail.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select 
            value={warehouseId} 
            onChange={(e) => setWarehouseId(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Warehouses</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Warehouse</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Available Qty</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Cost Price</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total Cost</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Retail Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading valuation...</td></tr>
              ) : filteredInventory.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No data found.</td></tr>
              ) : (
                filteredInventory.map((inv: any) => {
                  const cost = parseFloat(inv.product?.cost_price || '0');
                  const retail = parseFloat(inv.product?.selling_price || '0');
                  const qty = inv.quantity;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{inv.product?.name}</div>
                        <div className="text-xs text-gray-500">{inv.product?.sku}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{inv.warehouse?.name}</td>
                      <td className="p-4 text-sm font-bold text-gray-700 text-right">{qty}</td>
                      <td className="p-4 text-sm text-gray-600 text-right">₦{cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-sm font-medium text-gray-900 text-right">₦{(qty * cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-sm font-medium text-green-600 text-right">₦{(qty * retail).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
