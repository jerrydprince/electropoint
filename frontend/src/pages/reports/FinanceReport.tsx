import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Scale, Calendar, Filter } from 'lucide-react';
import api from '../../lib/axios';
import { format } from 'date-fns';

const COLORS = ['var(--primary)', '#1e3a8a', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
};

export default function FinanceReport() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch periods for the dropdown
  React.useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await api.get('/fiscal-periods');
        setPeriods(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPeriods();
  }, []);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const periodId = e.target.value;
    setSelectedPeriod(periodId);
    if (periodId) {
      const period = periods.find(p => p.id.toString() === periodId);
      if (period) {
        setStartDate(period.start_date.substring(0, 10)); // ensure YYYY-MM-DD
        setEndDate(period.end_date.substring(0, 10));
      }
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['finance-report', startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await api.get('/reports/finance', { params });
      return res.data.data;
    }
  });

  const handleExport = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8">Generating Finance Report...</div>;
  if (!data) return <div className="p-8">Error loading report.</div>;

  const { profit_and_loss: pl, balance_sheet: bs, expenses_by_category } = data;

  return (
    <div className="p-8 w-full mx-auto animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Comprehensive Financial Reports</h1>
          <p className="text-gray-500 mt-1">Real-time P&L, Balance Sheet, and expense analysis based on the general ledger.</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center shrink-0">
          <Download size={18} className="mr-2" /> Export PDF
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-4 print:hidden">
        <div className="flex items-center text-gray-500 font-medium pb-2 border-b-2 border-transparent">
          <Filter size={18} className="mr-2" /> Filters
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fiscal Period</label>
          <select 
            value={selectedPeriod} 
            onChange={handlePeriodChange}
            className="border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm py-2 px-3"
          >
            <option value="">Custom Dates</option>
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => { setStartDate(e.target.value); setSelectedPeriod(''); }}
            className="border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm py-2 px-3" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => { setEndDate(e.target.value); setSelectedPeriod(''); }}
            className="border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm py-2 px-3" 
          />
        </div>
      </div>

      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Electropoint Financial Report</h1>
        <p className="text-gray-500 font-medium">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          {startDate && endDate ? ` (Period: ${startDate} to ${endDate})` : ' (All-Time)'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit & Loss Statement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50">
            <TrendingUp className="text-primary mr-3" size={24} />
            <h2 className="text-xl font-black text-gray-900">Profit & Loss Statement</h2>
          </div>
          
          <div className="p-6 flex-1 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Total Revenue</span>
              <span className="font-bold text-gray-900">{formatMoney(pl.revenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Cost of Goods Sold (COGS)</span>
              <span className="font-bold text-red-600">({formatMoney(pl.cogs)})</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
              <span className="font-bold text-gray-900">Gross Profit</span>
              <span className="font-black text-primary text-lg">{formatMoney(pl.gross_profit)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 pt-4">
              <span className="text-gray-600 font-medium">Operating Expenses</span>
              <span className="font-bold text-red-600">({formatMoney(pl.operating_expenses)})</span>
            </div>
            
            <div className="flex justify-between items-center py-4 px-4 bg-secondary text-white rounded-xl mt-4 shadow-inner print:bg-transparent print:text-gray-900 print:shadow-none print:border-t-2 print:border-gray-900 print:rounded-none">
              <span className="font-bold uppercase tracking-wider text-sm">Net Profit</span>
              <span className="font-black text-2xl">{formatMoney(pl.net_profit)}</span>
            </div>
          </div>
        </div>

        {/* Balance Sheet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center">
              <Scale className="text-secondary mr-3" size={24} />
              <h2 className="text-xl font-black text-gray-900">Balance Sheet</h2>
            </div>
            {bs.is_balanced ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">Balanced</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full">Out of Balance</span>
            )}
          </div>
          
          <div className="p-6 flex-1 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Assets</h3>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-bold text-gray-900">Total Assets</span>
                <span className="font-black text-gray-900">{formatMoney(bs.assets)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Liabilities & Equity</h3>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Total Liabilities</span>
                <span className="font-bold text-gray-900">{formatMoney(bs.liabilities)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Owner's Equity</span>
                <span className="font-bold text-gray-900">{formatMoney(bs.equity)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Retained Earnings (Net Profit)</span>
                <span className="font-bold text-primary">{formatMoney(bs.retained_earnings)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg mt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total Liabilities & Equity</span>
                <span className="font-black text-gray-900">{formatMoney(bs.total_liabilities_and_equity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <DollarSign className="text-red-500 mr-2" size={20} />
          <h3 className="font-bold text-gray-900 text-lg">Operating Expenses by Category</h3>
        </div>
        
        {expenses_by_category.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <TrendingDown size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No expenses recorded for this period.</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses_by_category}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="total"
                  nameKey="name"
                >
                  {expenses_by_category.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatMoney(value), 'Amount']}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
