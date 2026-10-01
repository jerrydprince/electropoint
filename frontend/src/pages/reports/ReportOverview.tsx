import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Package, DollarSign, ArrowRight } from 'lucide-react';

export default function ReportOverview() {
  const reports = [
    {
      title: 'Sales Reports',
      description: 'Analyze daily trends, top-selling products, and overall revenue performance.',
      icon: <LineChart size={32} className="text-primary" />,
      link: '/reports/sales',
      bg: 'bg-red-50'
    },
    {
      title: 'Inventory Reports',
      description: 'Monitor stock health, including out-of-stock items, low stock warnings, and valuation.',
      icon: <Package size={32} className="text-orange-600" />,
      link: '/reports/inventory',
      bg: 'bg-orange-50'
    },
    {
      title: 'Financial Reports',
      description: 'Dive deep into expense breakdowns, P&L statements, and general financial health.',
      icon: <DollarSign size={32} className="text-emerald-600" />,
      link: '/finance/reports',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports Overview</h1>
        <p className="text-gray-500 mt-2 text-lg">Select a report module to view detailed analytics and export data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <Link 
            key={idx}
            to={report.link}
            className="group bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${report.bg} group-hover:scale-110 transition-transform duration-300`}>
              {report.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{report.title}</h3>
            <p className="text-gray-600 font-medium leading-relaxed">{report.description}</p>
            
            <div className="mt-8 flex items-center text-primary font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              View Report <ArrowRight size={18} className="ml-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
