import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, FileText, Percent, Banknote, 
  Landmark, CheckCircle, Calculator, BarChart 
} from 'lucide-react';
import api from '../../lib/axios';

export default function FinancialDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: async () => {
      const res = await api.get('/financial-dashboard');
      return res.data.data;
    },
    // Refetch often for real-time financials
    refetchInterval: 10000, 
  });

  const cards = [
    {
      title: 'Chart of Accounts',
      description: 'Manage assets, liabilities, equity, revenue, and expenses.',
      icon: Landmark,
      link: '/finance/chart-of-accounts',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Journal Entries',
      description: 'View and manage double-entry accounting records.',
      icon: FileText,
      link: '/finance/journals',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'General Ledger',
      description: 'Detailed transaction history by account.',
      icon: CheckCircle,
      link: '/finance/ledger',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Expenses',
      description: 'Track operational and general expenses.',
      icon: Wallet,
      link: '/finance/expenses',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Bank & Cash',
      description: 'Manage bank accounts, registers, and reconciliation.',
      icon: Banknote,
      link: '/cash-register',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Reports Hub',
      description: 'Access Sales, Inventory, and comprehensive Financial reports.',
      icon: BarChart,
      link: '/reports',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Tax Management',
      description: 'Configure tax rates and view tax liabilities.',
      icon: Calculator,
      link: '/finance/taxes',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Budgets',
      description: 'Set and track departmental or branch budgets.',
      icon: BarChart,
      link: '/finance/budgets',
      color: 'text-primary',
      bg: 'bg-primary/10'
    }
  ];

  if (isLoading) return <div className="p-8">Loading financial engine...</div>;
  if (!data) return <div className="p-8">Error loading data.</div>;

  return (
    <div className="p-8 w-full mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time metrics derived from all organizational transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <TrendingUp size={64} className="text-primary" />
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">₦{data.revenue.toLocaleString()}</p>
        </div>

        {/* COGS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
            <Banknote size={64} className="text-gray-800" />
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
            <Banknote size={24} className="text-gray-600" />
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Cost of Goods Sold</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">₦{data.cogs.toLocaleString()}</p>
        </div>

        {/* Gross Profit */}
        <div className="col-span-2 bg-secondary rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-white/60 font-bold tracking-wider uppercase text-sm mb-2">Gross Profit</p>
            <p className="text-6xl font-black tracking-tight mb-2 text-white">₦{data.gross_profit.toLocaleString()}</p>
            <p className="text-white/70 font-medium text-sm">Revenue minus Cost of Goods Sold</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Expenses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <TrendingDown size={24} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Total Expenses</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">₦{data.expenses.toLocaleString()}</p>
        </div>

        {/* VAT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <Percent size={24} className="text-gray-600" />
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">VAT Collected</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">₦{data.vat.toLocaleString()}</p>
        </div>

        {/* Net Profit */}
        <div className="col-span-2 bg-gradient-to-br from-primary to-red-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 font-bold tracking-wider uppercase text-sm mb-2">Net Profit</p>
            <p className="text-5xl font-black tracking-tight mb-2">₦{data.net_profit.toLocaleString()}</p>
            <div className="flex items-center text-white/90 text-sm font-medium">
              Gross Profit ({((data.gross_profit / (data.revenue || 1)) * 100).toFixed(1)}% margin) minus Expenses
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Receivables */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Accounts Receivable</p>
            <p className="text-4xl font-black text-gray-900">₦{data.receivables.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-2">Unpaid customer credit</p>
          </div>
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Wallet size={32} className="text-gray-400" />
          </div>
        </div>

        {/* Payables */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Accounts Payable</p>
            <p className="text-4xl font-black text-gray-900">₦{data.payables.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-2">Unpaid supplier invoices</p>
          </div>
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <FileText size={32} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-gray-100">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link 
              key={idx} 
              to={card.link} 
              className="group animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out"
              style={{ animationDelay: `${(idx * 100) + 300}ms` }}
            >
              <div className="relative h-full bg-white rounded-3xl border border-gray-200 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 group-hover:bg-gray-50/50">
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${card.bg} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out`}>
                    <Icon className={`w-7 h-7 ${card.color}`} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>
                
                {/* Arrow Icon that appears on hover */}
                <div className="absolute bottom-8 right-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                   <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
