import React, { useState } from 'react';
import { useInventoryDashboard } from '../../hooks/useInventory';
import { Package, TrendingDown, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWarehouses } from '../../hooks/useWarehouses';

export default function InventoryDashboard() {
  const [warehouseId, setWarehouseId] = useState('');
  const { data: dashboard, isLoading } = useInventoryDashboard(warehouseId);
  const { data: warehouses } = useWarehouses();

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-gray-500 mt-1">Central overview of your stock health</p>
        </div>
        <select 
          value={warehouseId} 
          onChange={(e) => setWarehouseId(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
        >
          <option value="">All Warehouses</option>
          {warehouses?.map((w: any) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard?.total_stock}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Inventory Value</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">₦{Number(dashboard?.inventory_value).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-yellow-400">
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard?.low_stock}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-sm font-medium text-gray-500">Out of Stock</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard?.out_of_stock}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
