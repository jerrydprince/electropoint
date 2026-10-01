import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, PackageX, Building2 } from 'lucide-react';
import api from '../../lib/axios';

export default function InventoryReport() {
  const [branchId, setBranchId] = useState('');

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data.data;
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-report', branchId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (branchId) params.append('branch_id', branchId);
      const res = await api.get(`/reports/inventory?${params.toString()}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8">Generating Inventory Report...</div>;
  if (!data) return <div className="p-8">Error loading report.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Health</h1>
          <p className="text-gray-500 mt-1">Alerts for low stock, depleted items, and overall valuation.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
          <div className="flex items-center px-2">
            <Building2 size={16} className="text-gray-400 mr-2" />
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent py-1 pl-0 pr-8"
            >
              <option value="">All Branches</option>
              {branches?.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* KPI Cards */}
        {data.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Inventory Value</p>
                <p className="text-4xl font-black text-gray-900">₦{Number(data.kpis.total_inventory_value).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Items In Stock</p>
                <p className="text-4xl font-black text-gray-900">{Number(data.kpis.total_items_in_stock).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Out of Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center">
            <PackageX className="text-red-600 mr-2" size={24} />
            <h3 className="font-bold text-red-900">Out of Stock ({data.out_of_stock.length})</h3>
          </div>
          <div className="overflow-y-auto max-h-96 flex-1 p-4">
            {data.out_of_stock.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No out of stock items!</p>
            ) : (
              <ul className="space-y-3">
                {data.out_of_stock.map((item: any) => (
                  <li key={item.sku} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">0 units</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center">
            <AlertTriangle className="text-orange-600 mr-2" size={24} />
            <h3 className="font-bold text-orange-900">Low Stock Warnings ({data.low_stock.length})</h3>
          </div>
          <div className="overflow-y-auto max-h-96 flex-1 p-4">
            {data.low_stock.length === 0 ? (
              <p className="text-gray-500 text-center py-8">All items above minimum stock!</p>
            ) : (
              <ul className="space-y-3">
                {data.low_stock.map((item: any) => (
                  <li key={item.sku} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.sku} (Min: {item.min_stock})</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold uppercase tracking-wider">{item.quantity} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
