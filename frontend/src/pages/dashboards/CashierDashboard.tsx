import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Lock, Unlock, CreditCard } from 'lucide-react';
import api from '../../lib/axios';
import { Link } from 'react-router-dom';

export default function CashierDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['cashier-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/cashier');
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Failed to load data.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cashier Shift Summary</h1>
          <p className="text-gray-500 mt-1">Your performance and register status for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><DollarSign size={24} className="text-primary" /></div>
          <p className="text-sm font-bold text-gray-500 mb-1">Your Sales Today</p>
          <p className="text-4xl font-black text-gray-900 tracking-tight">₦{data.sales_today.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-2">{data.transactions} Transactions</p>
        </div>

        <div className={`rounded-2xl shadow-sm border p-6 flex flex-col justify-between ${data.register_status === 'open' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-bold uppercase tracking-wider ${data.register_status === 'open' ? 'text-green-700' : 'text-red-700'}`}>Register Status</p>
              {data.register_status === 'open' ? <Unlock size={20} className="text-green-600" /> : <Lock size={20} className="text-red-600" />}
            </div>
            <p className={`text-3xl font-black ${data.register_status === 'open' ? 'text-green-900' : 'text-red-900'}`}>
              {data.register_status === 'open' ? 'OPEN' : 'CLOSED'}
            </p>
          </div>
          {data.register_status === 'open' ? (
             <p className="text-green-800 font-bold mt-4">Expected Cash: ₦{data.register_expected.toLocaleString()}</p>
          ) : (
             <Link to="/cash-register" className="inline-block mt-4 text-red-700 font-bold hover:underline">Go open register &rarr;</Link>
          )}
        </div>

        <div className="bg-gray-900 text-white rounded-2xl shadow-sm p-6">
          <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Payment Types</p>
          <div className="space-y-3">
            {data.payment_summary.length === 0 ? (
              <p className="text-gray-500">No payments collected yet.</p>
            ) : (
              data.payment_summary.map((p: any) => (
                <div key={p.payment_method} className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="font-bold capitalize flex items-center"><CreditCard size={16} className="mr-2 text-gray-400"/> {p.payment_method}</span>
                  <span className="font-mono">₦{parseFloat(p.total).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
