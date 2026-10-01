import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, Filter, Building2, Calendar } from 'lucide-react';
import api from '../../lib/axios';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
};

export default function SalesReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchId, setBranchId] = useState('');

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data.data;
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sales-report', startDate, endDate, branchId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (branchId) params.append('branch_id', branchId);
      
      const res = await api.get(`/reports/sales?${params.toString()}`);
      return res.data.data;
    }
  });

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenue\n"
      + data.daily_trend.map((d: any) => `${d.date},${d.revenue}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_trend.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) return <div className="p-8">Generating Sales Report...</div>;
  if (!data) return <div className="p-8">Error loading report.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Analytics</h1>
          <p className="text-gray-500 mt-1">Daily trends and top performing products.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
          <div className="flex items-center px-2 border-r border-gray-100">
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
          <div className="flex items-center px-2">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent py-1 px-0 w-32"
            />
            <span className="text-gray-400 mx-2">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent py-1 px-0 w-32"
            />
          </div>
          <button onClick={handleExport} className="ml-2 p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition" title="Export CSV">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* KPI Cards */}
        {data.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-3xl font-black text-gray-900">₦{Number(data.kpis.total_revenue).toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
              <p className="text-3xl font-black text-gray-900">{Number(data.kpis.total_orders).toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Units Sold</p>
              <p className="text-3xl font-black text-gray-900">{Number(data.kpis.total_units_sold).toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Order Value</p>
              <p className="text-3xl font-black text-gray-900">₦{Number(data.kpis.average_order_value).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
          </div>
        )}
        {/* Line Chart: Daily Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">30-Day Revenue Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value/1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [formatMoney(value), 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Top 10 Products by Volume Sold</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_products} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [value, 'Units Sold']}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total_sold" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
