import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Banknote, DollarSign, Package, Users, Building2, Wallet, FileText, ShoppingCart, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import api from '../../lib/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-v2'],
    queryFn: async () => {
      const res = await api.get('/dashboard/admin');
      return res.data.data;
    },
    refetchInterval: 15000, 
  });

  if (isLoading) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-gray-500 font-medium">Loading Enterprise Analytics...</p></div></div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load analytics.</div>;

  const { metrics, daily_trend, recent_sales, top_products } = data;

  // Format chart data
  const chartData = daily_trend?.map((d: any) => ({
    date: format(new Date(d.date), 'MMM dd'),
    revenue: parseFloat(d.revenue)
  })) || [];

  return (
    <div className="p-6 w-full mx-auto space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Enterprise Overview</h1>
          <p className="text-gray-500 mt-1">Real-time performance metrics across all operations.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-sm shadow-sm border border-gray-100">
          <Clock size={16} className="text-primary" />
          <span>Live Update Active</span>
        </div>
      </div>

      {/* Primary Metrics Grid (4 Equal Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-sm flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">₦{metrics.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-sm flex items-center justify-center">
              <Banknote size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Profit</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">₦{metrics.gross_profit.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-sm flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Profit</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">₦{metrics.net_profit.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-300 transition">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-sm flex items-center justify-center">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inventory</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">₦{metrics.inventory_value.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart (2/3) and Cash Flow (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-sm shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900">Revenue Trend (14 Days)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₦${(val/1000)}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '2px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow & Stats */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">Cash Flow Overview</h2>
            <div className="bg-orange-50/50 p-4 rounded-sm border border-orange-100 mb-4">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-gray-500 uppercase flex items-center">
                  <Wallet size={14} className="mr-1 text-orange-600" /> Receivables
                </p>
                <ArrowUpRight size={16} className="text-orange-500" />
              </div>
              <p className="text-xl font-black text-gray-900">₦{metrics.receivables.toLocaleString()}</p>
            </div>
            <div className="bg-red-50/50 p-4 rounded-sm border border-red-100">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-bold text-gray-500 uppercase flex items-center">
                  <FileText size={14} className="mr-1 text-red-600" /> Payables
                </p>
                <ArrowDownRight size={16} className="text-red-500" />
              </div>
              <p className="text-xl font-black text-gray-900">₦{metrics.payables.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-100"></div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 border border-gray-100 rounded-sm bg-gray-50/50">
              <Building2 size={16} className="mx-auto text-indigo-500 mb-1" />
              <p className="text-lg font-black text-gray-900">{metrics.branches}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Branches</p>
            </div>
            <div className="p-2 border border-gray-100 rounded-sm bg-gray-50/50">
              <Users size={16} className="mx-auto text-teal-500 mb-1" />
              <p className="text-lg font-black text-gray-900">{metrics.customers}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Customers</p>
            </div>
            <div className="p-2 border border-gray-100 rounded-sm bg-gray-50/50">
              <ShoppingCart size={16} className="mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-black text-gray-900">{metrics.suppliers}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Suppliers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions (1/2) and Top Products (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col h-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-gray-900">Recent Transactions</h2>
            <Link to="/sales-history" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar border border-gray-100 rounded-sm">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-200 font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2">Invoice</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent_sales?.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{sale.invoice_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 truncate max-w-[120px]">
                      {sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Walk-in'}
                    </td>
                    <td className="px-4 py-3 font-black text-gray-900 text-right">₦{parseFloat(sale.grand_total).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        sale.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                        sale.payment_status === 'partial' ? 'bg-orange-100 text-orange-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {sale.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!recent_sales || recent_sales.length === 0) && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No recent transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 flex flex-col h-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center">
              <Package size={20} className="mr-2 text-primary" /> Top Products
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {top_products?.length > 0 ? top_products.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center p-3 rounded-sm border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-sm bg-gray-200 flex items-center justify-center font-bold text-gray-700 mr-4 text-xs">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm">{p.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono truncate uppercase">{p.sku}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-black text-gray-900 text-sm">₦{(parseFloat(p.total_revenue) / 1000).toFixed(0)}k</p>
                  <p className="text-[10px] font-bold text-green-600">{p.total_sold} sold</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-400 py-8">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
