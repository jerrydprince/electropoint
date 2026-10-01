import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, ShoppingCart } from 'lucide-react';
import api from '../../lib/axios';

export default function BranchDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['branch-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/branch');
      return res.data.data.metrics;
    },
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="p-8">Loading Branch Analytics...</div>;
  if (!data) return <div className="p-8">Failed to load analytics.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Branch Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time performance for your branch.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-red-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10"><TrendingUp size={80} /></div>
          <div className="relative z-10">
            <p className="text-white/80 font-bold tracking-wider uppercase text-sm mb-2">Total Branch Revenue</p>
            <p className="text-5xl font-black tracking-tight mb-2">₦{data.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inventory Value</p>
            <Package size={24} className="text-gray-400" />
          </div>
          <p className="text-4xl font-black text-gray-900">₦{data.inventory_value.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sales Today</p>
            <ShoppingCart size={24} className="text-primary" />
          </div>
          <p className="text-4xl font-black text-gray-900">{data.sales_today}</p>
        </div>
      </div>
    </div>
  );
}
